
import json
import numpy as np
import pandas as pd
import tensorflow as tf

from pathlib import Path
from ucimlrepo import fetch_ucirepo

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score
)

BASE_DIR = Path(__file__).resolve().parent

# 1. Download real UCI dataset
print("Loading biological dataset...")

dataset = fetch_ucirepo(id=69)

X = dataset.data.features.copy()
y = dataset.data.targets.iloc[:, 0].copy()

# 2. Extract the 60 nucleotide positions
# Exclude any identifier columns if present.
sequence_columns = [
    col for col in X.columns
    if str(col).lower() not in [
        "instancename",
        "instance_name",
        "name"
    ]
]

# Sort Base1, Base2 ... Base60 numerically.
sequence_columns.sort(
    key=lambda col: int(
        ''.join(filter(str.isdigit, str(col))) or 0
    )
)

X = X[sequence_columns]

if X.shape[1] != 60:
    raise ValueError(
        f"Expected 60 DNA positions, got {X.shape[1]}"
    )

# 3. Encode DNA nucleotides
base_mapping = {
    "A": 0,
    "C": 1,
    "G": 2,
    "T": 3
}

def encode_sequence(row):
    sequence = "".join(
        str(value).strip().upper()
        for value in row
    )

    encoded = np.zeros((60, 4), dtype=np.float32)

    for i, base in enumerate(sequence):
        if base in base_mapping:
            encoded[i, base_mapping[base]] = 1.0

    return encoded

X_encoded = np.stack([
    encode_sequence(row)
    for row in X.to_numpy()
])

# 4. Encode target labels
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y.astype(str))

# Save label mapping
label_mapping = {
    str(i): str(label)
    for i, label in enumerate(encoder.classes_)
}

with open(
    BASE_DIR / "label_mapping.json",
    "w"
) as file:
    json.dump(label_mapping, file, indent=4)

# 5. Split training, validation and testing
X_train, X_temp, y_train, y_temp = train_test_split(
    X_encoded,
    y_encoded,
    test_size=0.30,
    random_state=42,
    stratify=y_encoded
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp,
    y_temp,
    test_size=0.50,
    random_state=42,
    stratify=y_temp
)

print("Training samples:", len(X_train))
print("Validation samples:", len(X_val))
print("Testing samples:", len(X_test))

# 6. Build 1D CNN model
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(60, 4)),

    tf.keras.layers.Conv1D(
        64, 5, activation="relu", padding="same"
    ),

    tf.keras.layers.MaxPooling1D(2),

    tf.keras.layers.Conv1D(
        128, 3, activation="relu", padding="same"
    ),

    tf.keras.layers.GlobalMaxPooling1D(),

    tf.keras.layers.Dense(64, activation="relu"),

    tf.keras.layers.Dropout(0.3),

    tf.keras.layers.Dense(
        len(encoder.classes_),
        activation="softmax"
    )
])

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# 7. Train the model
history = model.fit(
    X_train,
    y_train,
    validation_data=(X_val, y_val),
    epochs=30,
    batch_size=32,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True
        )
    ],
    verbose=1
)

# 8. Evaluate model on unseen test data
predictions = model.predict(X_test)
predicted_classes = np.argmax(predictions, axis=1)

accuracy = accuracy_score(
    y_test,
    predicted_classes
)

print("\nTEST ACCURACY:", accuracy)

print("\nCLASSIFICATION REPORT:")
print(
    classification_report(
        y_test,
        predicted_classes,
        labels=np.arange(len(encoder.classes_)),
        target_names=encoder.classes_,
        zero_division=0
    )
)

print("\nCONFUSION MATRIX:")
print(confusion_matrix(y_test, predicted_classes))

# 9. Save trained model
model.save(BASE_DIR / "splice_cnn.keras")

print("\nModel saved successfully!")
print("Dataset processing and training completed.")
