//once frontend sends file
import ConvertApi from 'convertapi-js'
var file;//file name
var filetype;//type of file
var conversion;// type to convert into 

//for 
//intial function is to convert wpd to pdf
//and documents
//creating the instance of convertApi and adding the file into the convertor
 let convertApi=ConvertApi.auth('sLWxDSAaL4XCSIN6Nb4NTVfOQkodGAb4');//put in api token
let params = convertApi.createParams();
params.add('File',file);
let result=await convertApi.convert(filetype,conversion,params);

//file url
let url=result.files[0].Url;

//additional add ons are :
// add function for converting lotus to pdf
