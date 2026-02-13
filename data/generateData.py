import os 
from pathlib import Path
import pandas as pd
import json


folder = "./codebases"

companies = [d for d in Path(folder).iterdir() if d.is_dir()]

chatColumns = ['path', 'chatID', 'exportedAt', 'totalPrompts', 'totalLogEntries', 'promptIDs']
chats_df = pd.DataFrame([], columns=chatColumns)

promptColumns = ['path', 'promptID','prompt', 'hasSeen', 'logCount', 'logIDs']
prompts_df = pd.DataFrame([], columns=promptColumns)

logColumns = ['path', 'logID', 'id', 'kind', 'type', 'tool', 'args', 'time', 'response', 'thinking', 'name', 'metadataIDs', 'requestMessageIDs', 'responseIDs']
logs_df  = pd.DataFrame([], columns=logColumns)

metadataColumns = ['path', 'metadataID', 'url', 'model', 'maxPromptTokens', 'location', 'startTime', 'endTime', 'duration', 'ourRequestId', 'requestId', 'serverRequestId', 'usage', 'tools']
metadata_df  = pd.DataFrame([], columns=metadataColumns)

requestMessageColumns = ['path', 'requestMessageID', 'role', 'content']
requestMessages_df  = pd.DataFrame([], columns=requestMessageColumns)

responseMessageColumns = ['path', 'responseMessageID', 'type', 'message', 'reason']
responsesMessages_df  = pd.DataFrame([], columns=responseMessageColumns)

chatID = 0 
promptID = 0 
logID = 0 
metadataID = 0
requestMessageID = 0 
responseMessageID = 0

for company in companies:
    models = [d for d in company.iterdir() if d.is_dir()]
    for model in models:
        folders = [d for d in model.iterdir() if d.is_dir()]
        for folder in folders:
            json_files = list(folder.glob('chat.json'))

            if(len(json_files) == 0):
                print("FOLDER WITH NO CHAT FILE", folder)
             
            for json_file in json_files:
                chatID += 1
                # Load JSON as dataframe
                with open(json_file, 'r') as f:
                    data = json.load(f)

                promptIDs = []
                if('prompts' in data.keys()):
                    prompts = data['prompts']
                    for prompt in prompts:
                        promptID += 1 
                        promptIDs.append(promptID)

                        logs = prompt['logs']
                        logIDs = []
                        metadataIDs = []
                        requestMessageIDs = []
                        responseMessageIDs = []

                        for log in logs:
                            logID += 1
                            logIDs.append(logID)

                            if('metadata' in log.keys()):
                                metadataID += 1
                                metadataIDs.append(metadataID)
                                metadatum = log['metadata']
                                metadatum_d = pd.DataFrame([{
                                    'path':str(json_file),
                                    'metadataID':metadataID, 
                                    'url':None if 'url' not in metadatum.keys() else metadatum['url'],
                                    'model':None if 'model' not in metadatum.keys() else metadatum['model'], 
                                    'maxPromptTokens':None if 'maxPromptTokens' not in metadatum.keys() else metadatum['maxPromptTokens'], 
                                    'location':None if 'location' not in metadatum.keys() else metadatum['location'], 
                                    'startTime':None if 'startTime' not in metadatum.keys() else metadatum['startTime'], 
                                    'endTime':None if 'endTime' not in metadatum.keys() else metadatum['endTime'], 
                                    'duration':None if 'duration' not in metadatum.keys() else metadatum['duration'], 
                                    'ourRequestId':None if 'ourRequestId' not in metadatum.keys() else metadatum['ourRequestId'], 
                                    'requestId':None if 'requestId' not in metadatum.keys() else metadatum['requestId'], 
                                    'serverRequestId':None if 'serverRequestId' not in metadatum.keys() else metadatum['serverRequestId'], 
                                    'usage':None if 'usage' not in metadatum.keys() else metadatum['usage'], 
                                    'tools':None if 'tools' not in metadatum.keys() else metadatum['tools'],
                                }], columns=metadataColumns)
                                metadata_df = pd.concat([metadata_df, metadatum_d], ignore_index=True)
                            
                            if('requestMessages' in log.keys()):
                                for requestMessage in log['requestMessages']['messages']:
                                    requestMessageID += 1
                                    requestMessageIDs.append(requestMessageID)

                                    requestMessage_d = pd.DataFrame([{
                                        'path':str(json_file),
                                        'metadataID':requestMessageID, 
                                        'role':requestMessage['role'],
                                        'content':requestMessage['content'], 
                                    }], columns=requestMessageColumns)
                                    requestMessages_df = pd.concat([requestMessages_df, requestMessage_d], ignore_index=True)
                                
                            if('response' in log.keys()):
                                if(type(log['response']) == list):
                                    for responseMessage in log['response']:
                                        responseMessageID += 1
                                        responseMessageIDs.append(responseMessageID)
                                        responseMessage_d = pd.DataFrame([{
                                            'path':str(json_file),
                                            'responseMessageID':requestMessageID, 
                                            'type':None,
                                            'message':responseMessage, 
                                            'reason':None,
                                        }], columns=requestMessageColumns)
                                        responsesMessages_df = pd.concat([responsesMessages_df, responseMessage_d], ignore_index=True)
                                else:
                                    responseMessageID += 1
                                    responseMessageIDs.append(responseMessageID)
                                    responseMessage_d = pd.DataFrame([{
                                        'path':str(json_file),
                                        'responseMessageID':requestMessageID, 
                                        'type':log['response']['type'],
                                        'message':None if 'message' not in log.keys() else log['response']['message'], 
                                        'reason':None if 'reason' not in log.keys() else log['response']['reason'],
                                    }], columns=requestMessageColumns)
                                    responsesMessages_df = pd.concat([responsesMessages_df, responseMessage_d], ignore_index=True)
                            

                            logs_d = pd.DataFrame([{
                                'path':str(json_file), 
                                'logID':logID, 
                                'id': None if 'id' not in log.keys() else log['id'], 
                                'kind':None if 'kind' not in log.keys() else log['kind'], 
                                'type':None if 'type' not in log.keys() else log['type'], 
                                'tool':None if 'tool' not in log.keys() else log['tool'], 
                                'args':None if 'args' not in log.keys() else log['args'], 
                                'time':None if 'time' not in log.keys() else log['time'], 
                                'response':None if 'response' not in log.keys() else log['response'], 
                                'thinking':None if 'thinking' not in log.keys() else log['thinking'], 
                                'name':None if 'name' not in log.keys() else log['name'], 
                                'metadataIDs':metadataIDs, 
                                'requestMessageIDs':requestMessageIDs, 
                                'responseIDs': responseMessageIDs, 
                            }], columns=logColumns)
                            logs_df = pd.concat([logs_df, logs_d])


                        prompts_d = pd.DataFrame([{
                            'path':str(json_file),
                            'promptID':promptID,
                            'exportedAt':prompt['prompt'], 
                            'totalPrompts':prompt['hasSeen'], 
                            'logIDs':logIDs, 
                        }], columns=promptColumns)
                        prompts_df = pd.concat([prompts_df, prompts_d])

                
                chats_d = pd.DataFrame([{
                    'path':str(json_file),
                    'chatID':chatID, 
                    'exportedAt':None if 'exportedAt' not in data.keys() else data['exportedAt'], 
                    'totalPrompts':None if 'totalPrompts' not in data.keys() else data['totalPrompts'], 
                    'totalLogEntries':None if 'totalLogEntries' not in data.keys() else data['totalLogEntries'], 
                    'promptIDs':promptIDs,
                }], columns=chatColumns)
                chats_df = pd.concat([chats_df, chats_d])

chats_df.to_pickle("chats.pkl")
prompts_df.to_pickle("prompts.pkl")
logs_df.to_pickle("logs.pkl")
metadata_df.to_pickle("metadata.pkl")
requestMessages_df.to_pickle("requestMessages.pkl")
responsesMessages_df.to_pickle("responsesMessages.pkl")