const $rdf = require('rdflib');
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');

var methods = {
  
/**
 * gets all the darcy posts in a pod
 * the pod must point to the root of the pod, and include a slash
 * @param {String} pod 
 * 
 * example : getPosts( "https://gaia.solid.community/" ).then( contents =>{ console.log(contents);});
 */
getPosts: function(pod){

  const LDP = $rdf.Namespace("http://www.w3.org/ns/ldp#");
  let store = $rdf.graph();

  const fetcher = new $rdf.Fetcher(store);

  let folder = $rdf.sym(methods.darcyRootPath(pod)+"post/");

  return new Promise(function(resolve,reject){
      fetcher.load(folder).then(() => {
          var folderItems = store.each(
              folder,
              LDP("contains"),
              null
          );

          resolve(folderItems);

          reject((error)=>{
            console.log("this id the getPost() err");
            console.log(error.message);
          });
      });
  });
},


/**
 * gets all the darcy comment URLs of a post
 * @param {String} postURL 
 * 
 * example : getComments("https://giulio.solid.community/public/darcy/post/2020-01-03TFOOOO.post").then(console.log);
 */
getComments: function(postURL){

  const LDP = $rdf.Namespace("http://www.w3.org/ns/ldp#");
  let store = $rdf.graph();
  
    const fetcher = new $rdf.Fetcher(store);
  
    let folder = $rdf.sym(methods.getDarcyPingbackPath(postURL));
    console.log(folder);
  
    return new Promise(function(resolve,reject){
        fetcher.load(folder).then(() => {
            var folderItems = store.each(
                folder,
                LDP("contains"),
                null
            ).map(t => { return methods.resolvePingbackURL(t["value"])});
  
            resolve(folderItems);
        }).catch(()=>{ resolve([]); });
    });
},
// 
/**
 * posts a new comment to a pod
 * the pod must point to the root of the pod, and include a slash
 * @param {String} pod 
 * @param {String} text 
 * 
 * example : publishPost( "https://gaia.solid.community/","test api!" ).then( response =>{ console.log(response);});
 */
publishPost: function(pod,text){

  let url = methods.getDarcyPostURL(pod,methods.ts());

  return new Promise(
    function(resolve,reject){
      solid.auth.fetch( url, {method: 'PUT', headers:{'Content-Type': 'text/plain'}, body: text } ).
        then(response => {
          if (response && response['statusText'] == 'Created'){  
              resolve(response);
              return;
          }
          reject(response)

      });
    });
},

fetchP: function(url, pars){

  return new Promise(
    function(resolve, reject) {
      solid.auth.fetch(
        url,
        pars
      ).then( response =>{
        if (!response || (response['statusText'] != 'Created' && response['statusText'] != 'OK')){
          console.log("result:"+ response['statusText'])
          reject(Error({ response: response}));
        } else {
          resolve(response);
        }
      })
    }
  );
},

publishComment: function(pod,originalContentURL,text){
  let commentURL = methods.getDarcyCommentURL(pod,methods.ts());
  let pingbackFileName = methods.getDarcyPingbackFileName(pod,methods.ts(),"comment");
  let pingbackPath = methods.getDarcyPingbackPath(originalContentURL);
  let [ocFolderName,activityPath] = methods.basePath(pingbackPath);

  console.log("creating activity folder for post");
  methods.fetchP(
    commentURL,
    {
      method: 'PUT',
      headers:{'Content-Type': 'text/plain'},
      body: text
    }
  ).then( response =>{
    console.log("local comment created, finding remote folder");


    return methods.fetchP(pingbackPath).
    catch(()=>{
      console.log("we did not find the remote path, let's try to build a folder")
      return methods.fetchP(
        activityPath,
        {
          method: 'POST',
          headers:{'Content-Type': 'text/turtle', 'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',"Slug": ocFolderName}
        }
      );
    });
  })
  .then( response =>{
    console.log("folder exists, creating file");
    return methods.fetchP(
      pingbackPath,
      {
        method: 'POST',
        headers:{'Content-Type': 'text/plain',"Slug": pingbackFileName},
        body: commentURL
      });
    

  }).then( response =>{
    console.log("file created");
    console.log(response);
  }).catch( (e) =>{
    console.log(e);
    
  });
},

deleteComment: function(commentURL,postURL,pod){ //comment URL, post URL, pod requesting action

  let loggedInPod = methods.getPodFromWebid(pod);
  let commentPod  = methods.getPodFromPodPath(commentURL);

  var actionURL = "";

  let pingbackFolder = methods.getDarcyPingbackPath(postURL); //get the post folder
 
  let splittedCommentURL = commentURL.split("/");
  let pingbackFile = "DARCY_"+splittedCommentURL[2]+"_"+splittedCommentURL[6].replace(".comment","")+"_comment.txt"; //transform comment URL in correct pingback filename


  if(loggedInPod == commentPod){
    actionURL = commentURL; //Delete your own comment
  }else{

    actionURL = pingbackFolder+pingbackFile; //Delete the pingback from your pod
  }


  return new Promise((resolve,reject)=>{ //Send delete of comment pingback
    methods.fetchP(actionURL,{ //only the pingback or comment then pingback
      method:"DELETE",
      headers:{'Content-Type': 'text/plain'},
    })
    .then((res)=>{

      if(loggedInPod == commentPod){ //if the one making the request is the owner
        
        methods.fetchP(pingbackFolder+pingbackFile,{ //also delete the pingback
          method:"DELETE",
          headers:{'Content-Type': 'text/plain'},
        })
        .then((res)=>{
          resolve(res);
          //console.log(res);
        })
        .catch((err)=>{
          resolve(err);
          console.log(err);
        });

      }else{
        resolve(res);
      }

    })
    .catch((err)=>{
      console.log(err);
      resolve(err);
    })
  });
 
},

deletePost: function(postURL,pod){

  let loggedInPod = methods.getPodFromWebid(pod); //get pod performing action
  let postPod  = methods.getPodFromPodPath(postURL); //Post URL

  let pingbackFolder = methods.getDarcyPingbackPath(postURL); //get the post folder

  console.log(postURL);

  if(postPod == loggedInPod){ //If owner of the post

    console.log("deleting post");
    return new Promise((resolve,reject)=>{
      methods.fetchP(postURL,{ //delete the post
        method:"DELETE",
        headers:{'Content-Type': 'text/plain'},
      })
      .then((res)=>{

        console.log("deliting pingbak folder");
        methods.fetchP(pingbackFolder,{ //Delete the pingback folder
          method:"DELETE",
          headers:{'Content-Type': 'text/plain'},
        })
        .then((res)=>{
          resolve(res);
        })
        .catch((err)=>{
          resolve(res);
          console.log(err);
        })

      })
      .catch((err)=>{
        console.log(err);
      });
    });

  }


},


getDarcyCommentURL: function(pod,slug){
/**
 * used to generate the local url to store the pod owner's own comments.
 * used with getDarcyPingbackURL() to post pingbacks on a different pod
 * 
 * @param {*} pod 
 * @param {*} slug 
 */
  return methods.getDarcyContentURL(pod, slug, 'comment');
},

getDarcyPostURL: function(pod,slug){
  return methods.getDarcyContentURL(pod, slug, 'post');
},


getDarcyContentURL: function(pod,slug,type){
  /**
 * DO NOT USE FOR PINGBACKS
 * @param {*} pod 
 * @param {*} slug 
 * @param {*} type 
 */
  type = methods.stabilizeURLFragment(type);
  slug = methods.stabilizeURLFragment(slug);

  let path = (type == 'post') ? 'post' : 'activity';
  return methods.darcyRootPath(pod)+path+'/'+slug+'.'+type;
},

stabilizeURLFragment: function(fragment){
  return fragment.replace(/[^a-z0-9.-]/gi,'-');
},

getDarcyPingbackURL: function(originalContentURL,pod,slug,pingbackType){
/**
 * generates a pingback url to PUT to the original content pod
 * @param {*} originalContentURL 
 * @param {*} pod 
 * @param {*} slug 
 * @param {*} pingbackType 
 * 
 * getDarcyPingbackURL("https://giulio.solid.community/public/darcy/post/2020-01-02T14.50.54.892Z.post", "https://gaia.solid.community/",ts(),"comment" )
 */

  let pingbackPath = methods.getDarcyPingbackPath(originalContentURL);
  if(!pingbackPath){ return null; }

  return pingbackPath+methods.getDarcyPingbackFileName(pod,slug,pingbackType);
},

getDarcyPingbackFileName: function(pod,slug,pingbackType){
  return "DARCY_"+methods.url_domain(pod)+'_'+methods.stabilizeURLFragment(slug)+'_'+methods.stabilizeURLFragment(pingbackType)+".txt";
},

getDarcyPingbackPath: function(originalContentURL){
  //find the slug of the original content to create an activity folder for it
  let ocFileName = originalContentURL.slice(originalContentURL.lastIndexOf('/')+1);
  if (!ocFileName){ return null; }
  return methods.darcyRootPath(methods.getPodFromPodPath(originalContentURL))+"activity/"+ocFileName+'/';
},

resolvePingbackURL: function(pingbackURL){
  return methods.getDarcyContentURLFromDarcyPingbackURL(pingbackURL);
},

getDarcyContentURLFromDarcyPingbackURL: function(pingbackURL){
  let elements = pingbackURL.replace(/\.txt$/,'').slice(pingbackURL.lastIndexOf('/')+1).split('_');
  if (elements.length != 4){ return null; }
  if (elements[0] != "DARCY"){ return null; }
  
  return methods.getDarcyContentURL("https://"+elements[1]+"/", elements[2], elements[3]);
},

listFriends: function(webid){
/**
 * grabs the webids this person has as so-called friends
 * might be worth to cache the result
 *  
 * @param {String} webid 
 * 
 * example: listFriends("https://gaia.solid.community/profile/card#me").then(console.log);
 */
  const store = $rdf.graph();
  const fetcher = new $rdf.Fetcher(store);

  return fetcher.load(webid).then(
    () => {
      return store.each($rdf.sym(webid), FOAF('knows'))
    }
  );
},


 
getName: async function(webid){
/**
 * resolves a webid's name
 * @param {String} webid 
 * 
 * example: getName("https://jollyorc.solid.community/profile/card#me").then( console.log);
 */
  const store = $rdf.graph();
  const fetcher = new $rdf.Fetcher(store);
  await fetcher.load(webid);
  const fullName = store.any($rdf.sym(webid), FOAF('name'));
  return ( fullName && fullName.value || webid);
  
},


darcyRootPath: function(pod){
  return pod+'public/darcy/'
},

getPodFromWebid: function(webid){
  return methods.getPodFromPodPath(webid);
},

getPodFromPodPath: function(path){
  return 'https://'+methods.url_domain(path)+'/';
},

url_domain: function(url) {
  var    a      = document.createElement('a');
         a.href = url;
  return a.hostname;
},

/**
 * returns a nice url-compatible date string
 * @param {Date} date 
 */
ts: function(date){
  date = date || new Date;
  return date.toISOString().replace(/:/g,'.');
},


basePath: function(path){
  const separator = "/";
  if (path.slice(-1) == separator){
    path = path.slice(0, -1);
  }
  const lastSeparatorPosition = path.lastIndexOf(separator);

  return [
    path.substr(lastSeparatorPosition + 1),
    path.substr(0, lastSeparatorPosition + 1),
  ];
},
      

};

export default methods;