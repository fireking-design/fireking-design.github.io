const { getMnistData } = require('./mnist-data-generation');
const { writeFileSync } = require('fs');
const math = require('mathjs');

const Network = layers => {

    const shuffle = array => {
        let m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
    }



    const feedForward = inputs => {
        for (let layerIndex = 0; layerIndex < networkSize; ++layerIndex) { // layers
        }
    }


        }

        }
    }

    const updateMiniBatch = ({ miniBatch, learningRate, lambda, trainingDataLength }) => {
        }
    }

    const predict = data => {
        const newData = data.map(data => {
            const output = feedForward(data.input).valueOf();
            const actual = output.indexOf(Math.max(...output));
            const ideal = data.output.indexOf(1);
            const cost = math.subtract(output, data.output).map(Math.abs);
            return {
                actual,
                ideal, 
                cost
            }
        }).reduce((acc, data) => ({
            accuracy: data.actual === data.ideal ? acc.accuracy + 1 : acc.accuracy, 
            cost: math.add(acc.cost, data.cost)
        }), { accuracy: 0, cost: math.zeros([data[0].output.length]) })

        newData.cost = math.divide(newData.cost, data.length);

        return newData;
    }

    const train = ({ trainingData, testingData, validatingData }, { epochs, miniBatchSize, learningRate, lambda }, { writeFrequency, save, showProgress }) => {

        const diagnostics = [];
        const trainingDataLength = trainingData.length;

        console.log('Training');
        for (let epochIndex = 0; epochIndex < epochs; ++epochIndex) {
            trainingData = shuffle(trainingData);
            for (let batchIndex = 0; batchIndex < trainingDataLength; batchIndex += miniBatchSize) {
                if(!(batchIndex % writeFrequency)) console.log(`Batch index ${batchIndex}`);
                const miniBatch = trainingData.slice(batchIndex, batchIndex + miniBatchSize);
                updateMiniBatch({ miniBatch, learningRate, lambda, trainingDataLength });
            }
            if (testingData) {
                console.log(`Epoch ${epochIndex} ${predict(testingData).accuracy} / ${testingData.length}`);
            } else {
                console.log(`Epoch ${epochIndex}`);
            }
            if (showProgress) {
                const trainingPrediction = predict(trainingData);
                const trainingAcc = (trainingPrediction.accuracy / trainingData.length) * 100;
                const trainingCost = trainingPrediction.cost.reduce((acc, cost) => acc + cost, 0);
                const testingPrediction = predict(testingData);
                const testingAcc = (testingPrediction.accuracy / testingData.length) * 100;
                const testingCost = testingPrediction.cost.reduce((acc, cost) => acc + cost, 0);
                const validatingPrediction = predict(validatingData);
                const validatingAcc = (validatingPrediction.accuracy / validatingData.length) * 100;
                const validatingCost = validatingPrediction.cost.reduce((acc, cost) => acc + cost, 0);
                diagnostics.push({ epochIndex, trainingAcc, trainingCost, testingAcc, testingCost, validatingAcc, validatingCost });
            }
        }
        if(save) writeFileSync('data/weights.json', JSON.stringify({ weights, biases }));
        if(showProgress) writeFileSync('data/diagnostics.json', JSON.stringify(diagnostics));
    }

    return {
        train, 
        predict
    }
}

(async () => {
    const data = await getMnistData();
    const epochs = 60;
    const miniBatchSize = 10;
    const learningRate = 0.1;
    const lambda = 5;
    const writeFrequency = 3000;
    const save = true;
    const showProgress = true
    const network = Network([28 * 28, 100, 10]);
    network.train(data, { epochs, miniBatchSize, learningRate, lambda }, { writeFrequency, save, showProgress });
    console.log('Final Accuracy: ', network.predict(data.testingData));
})()
