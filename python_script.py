import sys
import pickle
import json
import numpy as np

# Loading the saved model
loaded_model = pickle.load(open('trained_model.pkl', 'rb'))

def diabetesPrediction(input_data):
    # Convert input data from dictionary to a NumPy array
    input_data_as_numpy_array = np.asarray(list(input_data.values()))

    # Reshape the array as we are predicting for one instance
    input_data_reshaped = input_data_as_numpy_array.reshape(1, -1)

    prediction = loaded_model.predict(input_data_reshaped)
    print(prediction)

    if prediction[0] == 0:
        return 'The person does not have Diabetes'
    else:
        return 'The person has Diabetes'

if __name__ == '__main__':
    # Load input data as a JSON string from command line argument
    input_data_str = sys.argv[1]
    input_data = json.loads(input_data_str)

    # Call the prediction function
    result = diabetesPrediction(input_data)
    print(result)