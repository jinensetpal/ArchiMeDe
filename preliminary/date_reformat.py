from sklearn.preprocessing import MinMaxScaler
from datetime import date
import pandas as pd
import numpy as np

df = pd.read_csv('dankmemes_task1_train.csv')
print(df[['Date']].head())

days_df = [(date(int(i[0].split('-')[0]), int(i[0].split('-')[1]), int(i[0].split('-')[2])) - date(2015, 1, 1)).days for i in df[['Date']].values.tolist()]
print(np.array(days_df).reshape((1, 1600))[0, :5])
