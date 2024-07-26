const fs = require('fs')
const { parse } = require('csv-parse')
const path = require('path')

const csvData = []

const getSymbols = async () => {
    return new Promise((resolve, reject) => {
        const refreshDuplicate = async () => {
            let finalData = [new Set(csvData)]
            resolve(finalData)
        }

        fs.createReadStream(path.join(__dirname, 'instruments.csv'))
            .pipe(parse({ delimiter: ",", from_line: 2 }))
            .on("data", async (row) => {
                if (row[11] == 'NFO') {
                    await csvData.push(row[3])
                }
            })
            .on('error', (err) => {
                console.log(err)
            })
            .on('end', async () => {
                // console.log(csvData)
                await refreshDuplicate()
            })
    })
}

module.exports = getSymbols