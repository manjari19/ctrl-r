//once frontend sends file
import ConvertApi from 'convertapi-js'
import { acceptedfiletypes_dictionary } from './dict.js'
import { LotusFiletypes } from './LotusFiletypes.js'

// const ConvertLotus = (lotusFile) => {
//     const XLSX = require('xlsx');
//     const fs = require('fs').promises;

//     const workbook = XLSX.read(lotusFile, { type: 'buffer' });
//     XLSX.writeFileXLSX(workbook, "LotusXLSX");
//     const xlsxFile = fs.readFileSync("LotusXLSX");
//     fs.unlink("LotusXLSX");
//     return xlsxFile;
// }

export const ConvertFile = async (file, currentFiletype, targetFiletype) => {

    //for 
    //intial function is to convert wpd to pdf
    //and documents
    //creating the instance of convertApi and adding the file into the convertor

    // if (currentFiletype in LotusFiletypes){
    //     file = ConvertLotus(file);
    //     currentFiletype = "xlsx";
    // }

    if (currentFiletype in acceptedfiletypes_dictionary) {
        let convertApi=ConvertApi.auth('sLWxDSAaL4XCSIN6Nb4NTVfOQkodGAb4');//put in api token
        let params = convertApi.createParams();
        params.add('File',file);
        let result=await convertApi.convert(currentFiletype,targetFiletype,params);
        let url = result.files[0].Url;
        console.log(url);
        return url;
    }

    return "";
    
}


//additional add ons are :
// add function for converting lotus to pdf
