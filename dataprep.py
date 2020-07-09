from dataprep.eda import plot, plot_missing, plot_correlation
import pandas as pd

df = pd.read_csv('dankmemes_task1_train.csv', header=None)

plot(df)
plot_missing(df)
plot_correlation(df)
