//once frontend sends file
import ConvertApi from 'convertapi-js'


export const ConvertFile = async (file, currentFiletype, targetFiletype) => {

    //for 
    //intial function is to convert wpd to pdf
    //and documents
    //creating the instance of convertApi and adding the file into the convertor

    let convertApi=ConvertApi.auth('sLWxDSAaL4XCSIN6Nb4NTVfOQkodGAb4');//put in api token
    let params = convertApi.createParams();
    params.add('File',file);
    let result=await convertApi.convert(currentFiletype,targetFiletype,params);
    let url = result.files[0].Url;
    console.log(url);

}


//additional add ons are :
// add function for converting lotus to pdf
