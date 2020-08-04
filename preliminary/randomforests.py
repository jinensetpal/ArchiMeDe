import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

df = pd.read_csv('dankmemes_task1_train.csv')
X, y = df[['Engagement', 'Manipulation']].values, df[['Meme']].values

ct = ColumnTransformer([('standardsc', StandardScaler(), [0]),
                        ('nothing', 'passthrough', [1])])
X = ct.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X, y,
                                                     test_size=0.2,
                                                    stratify=y)
forest = RandomForestClassifier(n_estimators=500)
forest.fit(X_train, y_train.reshape(1280,))

importances = forest.feature_importances_
indices = np.argsort(importances)[::1]
feat_labels = df[["Engagement", "Manipulation"]].columns[:]
for f in range(X_train.shape[1]):
    print("%2d) %-*s %f" % (f + 1, 30,
                            feat_labels[indices[f]],
                            importances[indices[f]]))

plt.title('Feature Importance')
plt.bar(range(X_train.shape[1]),
        importances[indices],
        align='center')
plt.xticks(range(X_train.shape[1]),
           feat_labels[indices], rotation=90)
plt.xlim([-1, X_train.shape[1]])
plt.tight_layout()
plt.show()
