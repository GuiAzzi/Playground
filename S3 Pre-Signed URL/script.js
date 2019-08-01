// AWS account access
if (config)
    AWS.config = {accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey, region: config.region};

const s3 = new AWS.S3;
const bucket = 'mee-assets'
const progressBarEl = document.getElementById('progressBar');
const fileLink = document.querySelector('#resultDiv a');

let fileName = "";
let mimeType = "";
let file;


// Function to be executed when a file is inserted
function inputHandler(input) {
    // Gets file name
    fileName = input.files[0].name;
    // Gets MIME type
    mimeType = input.files[0].type;
    file = new FileReader();
    file.onload = () => {
        console.log('loaded');
        console.log(file);
    }
    file.readAsArrayBuffer(input.files[0]);
}

// Updates progress bar when uploading
function progressBar(progress) {
    progressBarEl.style.width = Math.round((progress.loaded * 100) / progress.total) + '%';
    progressBarEl.innerHTML = Math.round((progress.loaded * 100) / progress.total) + '%';
}

// Function to be executed when hitting submit
function buttonHandler(btn) {
    btn.disabled = true
    let params = {
        // Bucket name
        Bucket: bucket,
        // Path and file name in bucket
        Key: fileName,
        // MIME Type
        ContentType: mimeType,
        // Expires: 4
    }

    // Gets pre-signed s3 url, allowing to put an object
    s3.getSignedUrl('putObject', params, (err, url) => {
        if (err) {
            console.log('Error');
            console.log(err);
        }
        else {
            console.log(url);
            // Uploads object using the pre-signed url
            axios.put(url, file.result, {headers: {'Content-Type': mimeType}, maxContentLength: 52428890, onUploadProgress: (progress) => progressBar(progress)})
            .catch((err) => {
                console.log(err.message);
                document.getElementById('btnSubmit').disabled = false;
                fileLink.innerHTML = "Error";
            }).then((result) => {
                console.log(result.status);
                console.log(result);
                document.getElementById('btnSubmit').disabled = false;
                document.getElementById('resultDiv').style.display = 'block';
                fileLink.innerHTML = "Link to file"
                fileLink.href = "https://mee-assets.s3.amazonaws.com/" + encodeURIComponent(params.Key);
            })
        }
    })
}