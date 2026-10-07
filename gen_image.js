const canvas = document.getElementById('hiddenCanvas');
const ctx = canvas.getContext('2d');
const out = document.getElementById('out');

const width = canvas.width;
const height = canvas.height;

function add_alpha(data) {
    const new_data = new Uint8ClampedArray(data.length / 3 * 4);
    let data_index = 0;
    for (i = 0; i < new_data.length; i++) {
        if (i % 4 === 3) {
            new_data[i] = 255;
            continue;
        }
        new_data[i] = data[data_index++];
    }
    return new_data;
}

function remove_alpha(data) {
    let new_index = 0;
    const new_data = new Uint8ClampedArray(data.length / 4 * 3);
    for (i = 0; i < data.length; i++) {
        if (i % 4 === 3) {
            continue;
        }
        new_data[new_index] = data[i];
        new_index++;
    }
    return new_data;
}

function generate(text) {
    const imageData = ctx.createImageData(width, height);
    if (text.length > 256**4) {
        alert('Text is too long. Please limit to 256**4 characters.');
        return;
    }

    let data = imageData.data;

    let building_data = new Uint8ClampedArray((data.length / 4) * 3);

    console.log(`Encoding text length: ${text.length}`);
    // Store the length of the text in the first pixel
    building_data[0] = text.length & 0xFF;
    building_data[1] = (text.length >> 8) & 0xFF;
    building_data[2] = (text.length >> 16) & 0xFF;


    for (i = 3; i < text.length+3; i++) {

        building_data[i] = text.charCodeAt(i-3);

        // const red   = 0;
        // const green = 0;
        // const blue  = 0;
        // const alpha = 0;

        // data[i] = red;
        // data[i + 1] = green;
        // data[i + 2] = blue;
        // data[i + 3] = alpha;
    }
    console.log(building_data);
    data = add_alpha(building_data);
    imageData.data.set(data);

    console.log(data);
    console.log(decode(data));

    ctx.putImageData(imageData, 0, 0);
}

function decode(data) {
    console.log(data);
    data = remove_alpha(data);

    let length = data[0] + (data[1] << 8) + (data[2] << 16);

    console.log(`Decoded length: ${length}`);
    data = data.slice(3, 3 + length);
    let result = "";
    for ([i, byte] of data.entries()) {

        console.log(`data[${i}] = ${byte}`);
        result += String.fromCharCode(byte);
        console.log(`Decoded char: '${String.fromCharCode(byte)}'`);
        if (i > 100) {
            return;
        }
    }
    return result;
}

document.getElementById('downloadButton').addEventListener('click', () => {
    const text = document.getElementById('textInput').value;
    generate(text);

    const imageURL = canvas.toDataURL('image/png');

    // hidden link
    const downloadLink = document.createElement('a');
    downloadLink.href = imageURL;
    downloadLink.download = 'encoded.png';

    downloadLink.click();
    downloadLink.remove();
});

document.getElementById('imageUpload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    // 1. Read the uploaded file as a data URL
    reader.onload = e => {
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            console.log(data);

            console.log(decode(data));

            out.textContent = decode(data);

            console.log(`Loaded a ${canvas.width}x${canvas.height} image.`);
            console.log(`Total values in RGBA array: ${data.length}`);

            // You can now manipulate the 'data' array here and
            // call ctx.putImageData(imageData, 0, 0) to update it!
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
});
