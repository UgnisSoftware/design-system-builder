const https = require("https")
const fs = require("fs")

const downloadFile = async (hostname, path, fileFullPath, token) => {
  return new Promise((resolve, reject) => {
    https
      .get({ hostname, path, port: 443, headers: { "X-Figma-Token": token } }, (resp) => {
        // chunk received from the server
        resp.on("data", (chunk) => {
          fs.appendFileSync(fileFullPath, chunk)
        })

        // last chunk received, we are done
        resp.on("end", () => {
          resolve("File downloaded and stored at: " + fileFullPath)
        })
      })
      .on("error", (err) => {
        console.log(err)
        reject(new Error(err.message))
      })
  })
}

const token = "345664-6e0c3244-d0e0-4afd-be3d-981716b0db3b"
const hostname = "api.figma.com"
const path = "/v1/files/7M22BHfS2H6Fwm9Byu0JRY"
const fileFullPath = "./fig2.json"

downloadFile(hostname, path, fileFullPath, token)
  .then((res) => console.log(res))
  .catch((err) => console.log(err))
