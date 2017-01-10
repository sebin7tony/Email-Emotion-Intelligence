from angular_flask import app
import emotion 

import logging
import pandas as pd
import numpy as np
import json
import operator
from collections import defaultdict

logger = logging.getLogger("controller.data_explore")

EMAIL_DATASET = 'data/cleaned_1L_enron_emails_new.csv'

user_email_list_top50_dict = {}
user_email_list_top50_list = []
email_data = pd.DataFrame()
user_email_list_top_email_analytics = []


# The email in the dataframe is in the form (name@enron)
# this will convert the email to a list 
# @params : string
# @return : list
def get_email_list(email_string):
    email_string = email_string[1:len(email_string)-1]
    email_list = email_string.split(',')
    email_list = [str(x.strip()) for x in email_list]
    return email_list


def get_raw_email_data():
    global email_data
    if email_data.empty:
        email_data = pd.read_csv(EMAIL_DATASET,sep='\t')

    return email_data

# Get the user-email count for top 50 as a list 
# @params : None
# @return : list
def get_all_user_email_count():

    logger.debug("Inside get_all_user_email_count function")
    if len(user_email_list_top50_list) == 0 :
        # Building the user-emailcount dataframe
        # Eg:  From                   email_count
        #     (jeff.dasovich@enron.com)   9441
        #     (eric.bass@enron.com)       5122

        # Load the email_data if it is not loaded yet
        email_data = get_raw_email_data()

        user_email_list = email_data.groupby('From',as_index=False).agg({'content':np.size})
        user_email_list.rename(columns={'content': 'email_count'}, inplace=True)
        user_email_list.sort(['email_count'],ascending=False,inplace=True)
        user_email_list = user_email_list.reset_index(drop=True)

        user_email_list_top50 = user_email_list.head(50)

        for index,row in user_email_list_top50.iterrows():
            temp_dict = {}
            user_email = get_email_list(row['From'])[0] # There will be only one email in From field
            temp_dict["user_email"] = user_email
            temp_dict["email_count"] = row["email_count"]
            user_email_list_top50_list.append(temp_dict)

    return user_email_list_top50_list    

# this function gives all the emails of a sender as a list
# @params user string
# @params date_filter dict contain dict.from & dict.to
# @returns list
def get_user_emails(user,last_n_filter,recepient):
    
    raw_email_data = get_raw_email_data()
    if recepient:
        email_content_df = raw_email_data[(raw_email_data['From'] == '('+user+')') & (raw_email_data['To'] == '('+recepient+')')]
    else:
        email_content_df = raw_email_data[raw_email_data['From'] == '('+user+')']
    # Filter out emails based on last n emails
    if last_n_filter:
        email_content_df = email_content_df.head(last_n_filter)
        
    # Build list of emails
    email_list = [row for index, row in email_content_df.iterrows()]
    return email_list

#
# It creates analytics data dictionary for a single row of user
# Eg : {name: sebin,"email_count" :123L}
# @params : row -
# @params : date_filter filteres out the emails
#
def get_user_email_analytics(row,last_n_filter,recepient):
    user_email_analytics = {}
    user_email_analytics['user_email'] = row['user_email']
    user_email_analytics['filtered'] = True
    user_email_analytics['email_count'] = last_n_filter
    user_emails = get_user_emails(row['user_email'],last_n_filter,recepient)
    user_email_analytics['emotion'],user_email_analytics['sentiment'] = emotion.get_emotion_metric(user_emails,'percentage')
    
    return user_email_analytics

#@@@ API 1 @@@#
# This will give you the list of user email analytics info
# which include email,email count,sentiment and emotion percentage 
#
#  /emetrics/api/v1.0/top_users
#
def get_top_users_email_analytics():
    
    logger.debug("Inside the get_top_users_email_analytics")
    global user_email_list_top_email_analytics
    try:
        user_email_list_top_email_analytics = json.load(open("user_email_list_top_email_analytics.txt"))
    except:
        logger.debug("It could not read the user_email_list_top_email_analytics.txt")
        logger.debug("Get the list by parsing the dataset")
        user_email_list_top50_list = []
    
    if not user_email_list_top_email_analytics:
        # passing None as i want all the emails- no filter applied
        user_email_list_top_email_analytics = [get_user_email_analytics(row,None,None) for row in get_all_user_email_count()]
        json.dump(user_email_list_top_email_analytics, open("user_email_list_top_email_analytics.txt",'w'))

    return user_email_list_top_email_analytics[:24]

#@@@ API 2 @@@#
# This will give a single user email analytics
# with filters
# row['user_email'] row['email_count']
# pass None for all the emails
#
# /emetrics/api/v1.0/user_last_n
#

def get_filtered_user_email_analytics(row,last_n_filter):
    logger.debug("Inside the get_filtered_user_email_analytics")
    filtered_user_email_analytics = {}
    filtered_user_email_analytics = get_user_email_analytics(row,last_n_filter,None)
    return filtered_user_email_analytics


#@@@ API 5 @@@#
# This will give you the list of recepient specific email analytics info
# which include email,email count,sentiment and emotion percentage 
def get_reciepient_email_analytics(row,recepient):
    recepient_dict ={}
    recepient_dict = get_user_email_analytics(row,None,recepient)    
    return recepient_dict


#@@@ API 3 @@@#
# It gives you the number of emails send 
# by a given user to another
# @params user
#
# /emetrics/api/v1.0/recipient_freq
#
def get_reciever_frequency(user):
    recepient_dict = defaultdict(int)
    if email_data.empty:
        get_raw_email_data()
    user_emails_df = email_data[email_data['From'] == '('+user+')']
    for index,row in user_emails_df.iterrows():
        multi_recip = get_email_list(str(row['To']))
        for reciep in multi_recip:
            if '@' not in reciep:
                continue
            if reciep in recepient_dict:
                recepient_dict[reciep] += 1
            else:
                recepient_dict[reciep] = 1
    top_reciep = [[recip,recepient_dict[recip]] for recip in sorted(recepient_dict, key=recepient_dict.get, reverse=True)]
    return top_reciep[:100]

#@@@ API 4 @@@#
# It gives you the number of domains that are used 
# by a given user to another
# @params user
#
def get_domain_frequency(user):
    domain_dict ={}
    if email_data.empty:
        get_raw_email_data()
    user_emails_df = email_data[email_data['From'] == '('+user+')']
    for index,row in user_emails_df.iterrows():
        multi_recip = get_email_list(str(row['To']))
        for reciep in multi_recip:
            if '@' in reciep:
                start_loc = reciep.find('@')
                domain = reciep[start_loc+1:]
                if domain in domain_dict:
                    domain_dict[domain] += 1
                else:
                    domain_dict[domain] = 1
            else:
                continue
            
    return domain_dict

#@@@ API 6 @@@#
# It gives you the number of domains that are used 
# by a given user to another
# @params user
#
#
def get_user_emotion_analytics(user):
    logger.debug("Inside the get_user_emotion_analytics user is %s" %(user))
    email_wise_emotion_count = []
    email_list = []
    email_list = get_user_emails(user,100,None)
    logger.debug("Length of email list is %s" %(len(email_list)))
    email_wise_emotion_count = emotion.get_emailwise_emotion_metric(email_list)
    return email_wise_emotion_count


def get_emails(emailid):
    logger.debug("Inside the get_emails is %s" %(emailid))
    raw_email_data = get_raw_email_data()
    raw_email_data = raw_email_data.fillna(0)
    email = raw_email_data[raw_email_data['Message-ID'] == emailid]
    return email.to_dict('list')


if __name__ == '__main__':
	k = get_top_user_email_analytics()
	#print k