import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from mlxtend.plotting import plot_decision_regions
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree

df = pd.read_csv('dankmemes_task1_train.csv')
X, y = df[['Engagement', 'Manipulation']].values, df[['Meme']].values
X_train, X_test, y_train, y_test = train_test_split(X, y,
                                                    test_size=0.2,
                                                    stratify=y)
dtc = DecisionTreeClassifier(criterion='gini',
                             max_depth=4)
dtc.fit(X_train, y_train)

X_combined = np.vstack((X_train, X_test))
y_combined = np.vstack((y_train, y_test))

plot_decision_regions(X_combined, y_combined.reshape(1600,),
                      clf=dtc)
plt.legend(loc='best')
plt.tight_layout()
plt.show()
plot_tree(dtc)
plt.show()
