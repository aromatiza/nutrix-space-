'use strict';
// Vercel function entrypoint. Rewrites send the original /api/* URL in `route`.
const handler=require('../server.js');
module.exports=async function(req,res){
  const url=new URL(req.url||'/', 'https://nutrix.invalid');
  const forwarded=url.searchParams.get('route');
  if(!forwarded || !/^(?:health|off\/(?:product\/\d{8,14}|search)|ai\/(?:chat|photo|vision|image))$/.test(forwarded)){
    res.statusCode=404;
    res.setHeader('Content-Type','application/json; charset=utf-8');
    return res.end(JSON.stringify({error:'Route API inconnue'}));
  }
  url.searchParams.delete('route');
  req.url='/api/'+forwarded+(url.searchParams.size?'?'+url.searchParams.toString():'');
  return handler(req,res);
};
