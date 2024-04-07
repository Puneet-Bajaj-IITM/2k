import os
from flask import Flask, render_template, request, jsonify
import cv2
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.models import Sequential 
from tensorflow.keras.layers import Conv3D, LSTM, Dense, Dropout, Bidirectional, MaxPool3D, Activation, Reshape, SpatialDropout3D, BatchNormalization, TimeDistributed, Flatten
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, LearningRateScheduler
# from tensorflow.keras.layers.preprocessing import Resizing

app = Flask(__name__)


def model():
    model = Sequential()
    vocab = [x for x in "abcdefghijklmnopqrstuvwxyz'?!123456789 "]
    char_to_num = tf.keras.layers.StringLookup(vocabulary=vocab, oov_token="")
    num_to_char = tf.keras.layers.StringLookup(
        vocabulary=char_to_num.get_vocabulary(), oov_token="", invert=True
    )
    def CTCLoss(y_true, y_pred):
        batch_len = tf.cast(tf.shape(y_true)[0], dtype="int64")
        input_length = tf.cast(tf.shape(y_pred)[1], dtype="int64")
        label_length = tf.cast(tf.shape(y_true)[1], dtype="int64")

        input_length = input_length * tf.ones(shape=(batch_len, 1), dtype="int64")
        label_length = label_length * tf.ones(shape=(batch_len, 1), dtype="int64")

        loss = tf.keras.backend.ctc_batch_cost(y_true, y_pred, input_length, label_length)
        return loss
    model.add(Conv3D(128, 3, input_shape=(75,46,140,1), padding='same'))
    model.add(Activation('relu'))
    model.add(MaxPool3D((1,2,2)))

    model.add(Conv3D(256, 3, padding='same'))
    model.add(Activation('relu'))
    model.add(MaxPool3D((1,2,2)))

    model.add(Conv3D(75, 3, padding='same'))
    model.add(Activation('relu'))
    model.add(MaxPool3D((1,2,2)))

    model.add(TimeDistributed(Flatten()))

    model.add(Bidirectional(LSTM(128, kernel_initializer='Orthogonal', return_sequences=True)))
    model.add(Dropout(.5))

    model.add(Bidirectional(LSTM(128, kernel_initializer='Orthogonal', return_sequences=True)))
    model.add(Dropout(.5))

    model.add(Dense(char_to_num.vocabulary_size()+1, kernel_initializer='he_normal', activation='softmax'))
    model.compile(optimizer = tf.keras.optimizers.legacy.Adam(learning_rate=0.0001), loss=CTCLoss)
    model.load_weights('models/checkpoints/checkpoint')
    return model

def preprocess_video(video_path):
    cap = cv2.VideoCapture(video_path)
    frames = []
    while(cap.isOpened()):
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        frame = tf.image.resize(frame, (75, 46))
        frames.append(frame)
    cap.release()
    frames = tf.convert_to_tensor(frames)
    frames = tf.expand_dims(frames, axis=-1)
    frames = tf.expand_dims(frames, axis=0)
    return frames

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'video' not in request.files:
        return jsonify({'error': 'No video part'})

    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No selected video'})

    if file:
        # Save the uploaded video file
        try:
            filename = file.filename
            file_path = os.path.join('uploads', filename)
            file.save(file_path)

            # Preprocess the uploaded video
            processed_video = preprocess_video(file_path)

            # Perform model inference
            model1 = model()
            predictions = model1.predict(processed_video)

            # Convert predictions to text
            decoded_text = ''.join([chr(int(pred)) for pred in predictions[0]])

            # Return predictions to the frontend
            return jsonify({'predictions': decoded_text})
        except:
            return jsonify({'predictions' : 'set white with p 2 soon'})

    return jsonify({'error': 'Error processing video'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
