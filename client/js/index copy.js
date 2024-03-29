const initCanvas = ({ predict }) => {
    const predictButton = document.getElementById('predict');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext("2d");

    const { width: canvasWidth, height: canvasHeight } = canvas;

    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = 2.5;

    let isDrawing = false;
    let clearCanvas = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener('mousedown', e => {
        if (clearCanvas) {
            // context.fillStyle = '#fff';
            context.clearRect(0, 0, canvasWidth, canvasHeight)
            clearCanvas = false;
        };
        [lastX, lastY] = [e.offsetX * canvasWidth / 200, e.offsetY * canvasHeight / 200];
        isDrawing = true
    });

    canvas.addEventListener('mousemove', e => {
        if (!isDrawing) return;
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(e.offsetX * canvasWidth / 200, e.offsetY * canvasHeight / 200);
        context.stroke();
        context.closePath();
        [lastX, lastY] = [e.offsetX * canvasWidth / 200, e.offsetY * canvasHeight / 200];
    })

    canvas.addEventListener('mouseup', () => isDrawing = false);

    canvas.addEventListener('mouseout', () => isDrawing = false);

    predictButton.addEventListener('click', () => {
        const pixels = context.getImageData(0, 0, canvasWidth, canvasHeight);
        let inputs = [...Array(784)].fill(0);
        for (let pixelIndex = 3; pixelIndex < pixels.data.length; pixelIndex += 4) {
            const inputIndex = Math.floor((pixelIndex - 3) / (4));
            inputs[inputIndex] += pixels.data[pixelIndex];
        }
        console.log(inputs);
        document.getElementById('prediction').innerText = predict(inputs);
        clearCanvas = true;
    })

};

const Network2 = (coefficients) => {

    const sigmoid = value => 1 / (Math.exp(-value) + 1);

    const feedForward = inputs => {
        let activations = inputs;
        const networkSize = coefficients.length;
        for (let layerIndex = 0; layerIndex < networkSize; ++layerIndex) { // layers
            const layer = coefficients[layerIndex];
            const layerSize = layer.length;
            const newInputs = []
            for (let neuronIndex = 0; neuronIndex < layerSize; ++neuronIndex) { // neurons
                const neuron = layer[neuronIndex];
                let neuronTotal = neuron.bias;
                for (let weightIndex = 0; weightIndex < neuron.weights.length; ++weightIndex) { // weights
                    neuronTotal += neuron.weights[weightIndex] * activations[weightIndex];
                }
                const activation = sigmoid(neuronTotal);
                neuron.output = activation;
                newInputs.push(activation);
            }
            activations = newInputs;
        }
        return activations;
    }

    const predict = inputs => {
        const outputs = feedForward(inputs);
        console.log(outputs.map(output => Math.round(output * 1000) / 1000));
        return outputs.indexOf(Math.max(...outputs));
    }

    // const feedForward2 = input => {
    //     const networkSize = layers.length - 1;
    //     for (let layerIndex = 0; layerIndex < networkSize; ++layerIndex) { // layers
    //         input = sigmoid(math.add(math.multiply(weights[layerIndex], input), biases[layerIndex]));
    //     }
    //     return input;
    // }

    return {
        feedForward, 
        predict
    }
}

(async () => (await (await fetch('/client/data/weights.json')).json()))().then(coefficients => initCanvas(Network2(coefficients)))

// const fetchNetwork = async () => (await (await fetch('/client/data/weights.json')).json());

// fetchNetwork().then(network => {
//     network = Network2(network);
//     initCanvas(network);
// })

// const Network = (suppliedNetwork, layers) => {

//     const network = suppliedNetwork || layers.slice(1).map((layer, layerIndex) => { // layers
//         return [...Array(layer)].map(() => { // neuron
//             return {
//                 weights: [...Array(layers[layerIndex])].map(() => Math.random() * (1 - -1) - 1), // weights
//                 newWeights: [...Array(layers[layerIndex])].map(() => 0), // newWeights
//                 weightConstants: [...Array(layers[layerIndex])].map(() => ({ derivative: 0, cost: 0 })),
//                 bias: Math.random() * (1 - -1) - 1,
//                 newBias: 0,
//                 output: 0, 
//                 delta: 1
//             }
//         })
//     })

    // const sigmoid = value => 1 / (Math.exp(-value) + 1);

//     const sigmoidDerivative = output => output * (1 - output);

//     const feedForward = inputs => {
//         let activations = inputs;
//         const networkSize = network.length;
//         for (let layerIndex = 0; layerIndex < networkSize; ++layerIndex) { // layers
//             const layer = network[layerIndex];
//             const layerSize = layer.length;
//             const newInputs = []
//             for (let neuronIndex = 0; neuronIndex < layerSize; ++neuronIndex) { // neurons
//                 const neuron = layer[neuronIndex];
//                 let neuronTotal = neuron.bias;
//                 for (let weightIndex = 0; weightIndex < neuron.weights.length; ++weightIndex) { // weights
//                     neuronTotal += neuron.weights[weightIndex] * activations[weightIndex];
//                 }
//                 const activation = sigmoid(neuronTotal);
//                 neuron.output = activation;
//                 newInputs.push(activation);
//             }
//             activations = newInputs;
//         }
//         return activations;
//     }

//     const backPropagation = (inputs, expectedOutput, learningRate) => {
//         for (let layerIndex = network.length - 1; layerIndex >= 0; --layerIndex) {
//             const layer = network[layerIndex];
//             if (layerIndex !== network.length - 1) {
//                 for (let currentNeuronIndex = 0; currentNeuronIndex < layer.length; ++currentNeuronIndex) {
//                     const neuron = layer[currentNeuronIndex];
//                     let cost = 0;
//                     for (let nextNeuronIndex = 0; nextNeuronIndex < network[layerIndex + 1].length; ++nextNeuronIndex) {
//                         const nextNeuron = network[layerIndex + 1][nextNeuronIndex];
//                         cost += nextNeuron.weightConstants[currentNeuronIndex].derivative * nextNeuron.weightConstants[currentNeuronIndex].cost * nextNeuron.weights[currentNeuronIndex]
//                     }
//                     const derivative = sigmoidDerivative(layer[currentNeuronIndex].output);
//                     for (let weightIndex = 0; weightIndex < neuron.weights.length; ++weightIndex) {
//                         let previousOutput;
//                         if (layerIndex - 1 < 0) previousOutput = inputs[weightIndex]
//                         else previousOutput = network[layerIndex - 1][weightIndex].output;
//                         neuron.newWeights[weightIndex] -= (learningRate * previousOutput * derivative * cost);
//                         neuron.weightConstants[weightIndex].derivative = derivative;
//                         neuron.weightConstants[weightIndex].cost = cost;
//                     }
//                     neuron.newBias -= (learningRate * derivative * cost);
//                 }
//             } else {
//                 for (let currentNeuronIndex = 0; currentNeuronIndex < layer.length; ++currentNeuronIndex) {
//                     const neuron = layer[currentNeuronIndex];
//                     const derivative = sigmoidDerivative(neuron.output)
//                     const cost = neuron.output - expectedOutput[currentNeuronIndex];
//                     for (let weightIndex = 0; weightIndex < neuron.weights.length; ++weightIndex) {
//                         const previousOutput = network[layerIndex - 1][weightIndex].output;
//                         neuron.newWeights[weightIndex] -= (learningRate * previousOutput * derivative * cost);
//                         neuron.weightConstants[weightIndex].derivative = derivative;
//                         neuron.weightConstants[weightIndex].cost = cost;
//                     }
//                     neuron.newBias -= (learningRate * derivative * cost)
//                 }
//             }
//         }
//     }

//     const updateWeights = () => {
//         for (let layerIndex = 0; layerIndex < network.length; ++layerIndex) { // layers
//             for (let neuronIndex = 0; neuronIndex < network[layerIndex].length; ++neuronIndex) {
//                 const neuron = network[layerIndex][neuronIndex];
//                 for (let inputIndex = 0; inputIndex < neuron.weights.length; ++inputIndex) {
//                     neuron.weights[inputIndex] = neuron.newWeights[inputIndex]
//                 }
//                 neuron.bias = neuron.newBias
//             }
//         }
//     }

//     const predictArray = data => {
//         return data.map(data => {
//             const output = feedForward(data.input);
//             const actual = output.indexOf(Math.max(...output)) + 1;
//             const ideal = data.output.indexOf(1) + 1;
//             return {
//                 actual,
//                 ideal
//             }
//         }).reduce((acc, data) => data.actual === data.ideal ? acc +  1 : acc, 0) / data.length
//     }

    // const predict = inputs => {
    //     const outputs = feedForward(inputs);
    //     console.log(outputs);
    //     return outputs.indexOf(Math.max(...outputs));
    // }

//     const train = (data, epochs, batches, learningRate) => {
//         for (let i = epochs; i > 0; --i) { // epoch
//             for (let j = 0; j < batches + 2; ++j) { // batch
//                 const batch = data.splice(Math.floor(Math.random() * (data.length - (data.length / batches))), (data.length / batches));
//                 for (let dataIndex = 0; dataIndex < batch.length; ++dataIndex) {
//                     const data = batch[dataIndex];
//                     feedForward(data.input);
//                     backPropagation(data.input, data.output, learningRate);
//                     updateWeights(data.input);
//                 }
//             }
//         }
//     }

//     return {
//         predict,
//         predictArray,
//         feedForward,
//         train
//     }
// }
    