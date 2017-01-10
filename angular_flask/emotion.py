from angular_flask import app

from collections import OrderedDict, defaultdict, Counter
from nltk.tokenize import word_tokenize
import csv
import pandas as pd
import logging

logger = logging.getLogger("controller.emotion")

LEXICON_FILE = "data/NRC-emotion-lexicon-wordlevel-alphabetized-v0.92.txt"

emailID_emotion_count_dict = {}

wordList = defaultdict(list)
emotionList = defaultdict(list)
with open(LEXICON_FILE,'r') as f:
    reader = csv.reader(f,delimiter='\t')
    headerRow = [i for i in range(0,46)]
    for row in headerRow:
        next(reader)
    for word, emotion, present in reader:
        if int(present) == 1:
            wordList[word].append(emotion)
            emotionList[emotion].append(word)


# Create emotion count for a given list of strings
# @params - list
# @output - dict
def generate_emotion_count(email_row):
    emoCount = Counter()
    
    if email_row['Message-ID'] in emailID_emotion_count_dict:
        # Getting already parsed and processed emotion count
        emoCount += Counter(emailID_emotion_count_dict[email_row['Message-ID']])
    else:
        if wordList:
            email_text = email_row['content'].decode('latin-1')
            for token in word_tokenize(email_text):
                token = token.lower()
                emoCount += Counter(wordList[token])
            emailID_emotion_count_dict[email_row['Message-ID']] = dict(emoCount)
            
    return emoCount

# Get percentage
# @params - dict
# @return - dict
def get_percentage(count_dict):
    total = 0;
    percent = {}
    for key,val in count_dict.iteritems():
        total += val
    for key,val in count_dict.iteritems():
        percent[key] =  100*val/total
    return percent


# Get emotion metric
# @params - list(email row),String
# @output - dict,dict
def get_emotion_metric(email_list,MODE):
    emotion_count = [generate_emotion_count(email) for email in email_list]
    emotion_df = pd.DataFrame(emotion_count)
    emotion_df = emotion_df.fillna(0)
    emotion_metric = dict(emotion_df.sum())
    #print emotion_metric
    sentiment = {}
    sentiment['positive'] = emotion_metric.pop('positive')
    sentiment['negative'] = emotion_metric.pop('negative')

    if MODE == 'percentage':
        emotion_metric_percentage = get_percentage(emotion_metric)
        sentiment_percentage = get_percentage(sentiment)
        return emotion_metric_percentage,sentiment_percentage
    else:
        # might need to do the needful stuffs here
        return emotion_metric,sentiment


# Get email wise emotion metric returns in percentile
# @params - list(email row),String
# @output - dict,dict
def get_emailwise_emotion_metric(email_list):
    logger.debug("Inside get_emailwise_emotion_metric")
    emotion_count = [generate_emotion_count(email) for email in email_list]
    emotion_df = pd.DataFrame(emotion_count)
    emotion_df = emotion_df.fillna(0)
    logger.debug(emotion_df)
    max_value_emotion = max(emotion_df[['anger','anticipation','disgust','fear','joy','sadness','surprise','trust']].max())
    max_value_sentiment = max(emotion_df[['negative','positive']].max())

    logger.debug("max_value_emotion")
    logger.debug(max_value_emotion)
    logger.debug("max_value_sentiment %s" %(max_value_sentiment))
    
    emotion_percentile = emotion_df[['anger','anticipation','disgust','fear','joy','sadness','surprise','trust']]/max_value_emotion
    sentiment_percentile = emotion_df[['negative','positive']]/max_value_sentiment
    
    logger.debug("emotion_percentile")
    logger.debug(emotion_percentile)
    emotion_metric_percentage = []
    for index,email in enumerate(email_list):
        emotion_metric_percentage.append({"email_id":email['Message-ID'],"emotion_percentile":dict(emotion_percentile.ix[index]),"sentiment_percentile":dict(sentiment_percentile.ix[index])})
    
    logger.debug("Exiting get_emailwise_emotion_metric.... %s" %(len(emotion_metric_percentage)))
    return emotion_metric_percentage
