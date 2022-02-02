$(document).ready(() =>{
  const app = firebase.app();
  
  //initialise database variable
  var db = firebase.firestore();
  //Get users collection
  var users = db.collection('Users');
  $('#searchForm').on('submit', (e) =>{
      let searchText = $('#searchText').val();
      getMovies(searchText);
      e.preventDefault();
  });
  
  //Get currently signed in user   https://firebase.google.com/docs/auth/web/manage-users#web-version-8
  firebase.auth().onAuthStateChanged((user)=>{
    if(user){ //if there is a user logged in
        //Declare UID variable and reference to user document
        var UID = user.uid;
        var userRef = users.doc(UID);

        //Display user's name and profile picture
        $('#usrName').empty().append(user.displayName);
        $('#usrIMG').attr("src",user.photoURL);

        userRef.get().then((doc)=>{
          //If the user has not previously logged in, create a user document in the users collection
          if(!doc.exists){
            console.log("No user document exists");
            console.log("Adding user to Users collection");
            userRef.set({
                name: user.displayName,
                uid: UID,
                email: user.email,
                watchlist: []
            });
          }
          else{
            console.log("User already exists");
          }
        })
    }else{
      //redirect to login screen if no user is logged in 
      location.href='login.html';
    }
  });
})
async function getMovies(searchText){
  //Retrieve search results via omdb API
  axios.get('https://www.omdbapi.com/?apikey=3c9e71f7&s=' +searchText)
  .then((response) => {
    let movies = response.data.Search;
    let output = '';
    //Loop through each object in the response 
    $.each(movies, async function(index, movie){
      //Fetch full details of the media by searching by IMDB id
      let thisMovie = await getMovieByID(movie.imdbID);
      output += `
        <div class="col-md-3 movie">
          <div class="well text-center">
            <h5>${thisMovie.Title}</h5>
            <img class = "poster" src = "${thisMovie.Poster}";>
            <button onClick='addToList(${JSON.stringify(thisMovie).replaceAll('\'','&#39;')})'>Add to watchlist</button>
            <button onClick='showDetails(${JSON.stringify(thisMovie).replaceAll('\'','&#39;')})';>Movie Details</button>
          </div>
        </div>
      `;
      $('#movies').html(output);
    });
  }); 
}


//Using axios promise to return JSON object with full details of the movie
async function getMovieByID(id){
  return axios.get('https://www.omdbapi.com/?apikey=3c9e71f7&i='+id).then(response=>response).then(data=>data.data)
}

function addToList(movie){
  
  var db = firebase.firestore();
  var users = db.collection('Users');
  var user = firebase.auth().currentUser;
  var userRef = users.doc(user.uid);
  userRef.update({
    watchlist: firebase.firestore.FieldValue.arrayUnion(movie)
  });
  alert(movie.Title+" added to watchlist!");
  
}

async function showDetails(movie){
  $(".popup-content").empty().append(`<h2>${movie.Title}:</h2>
  <p>
    <b>Director(s): </b>${movie.Director}<br />
    <b>Released: </b>${movie.Released}<br />
    <b>Genre: </b>${movie.Genre}<br />
    <b>Plot: </b>${movie.Plot}<br />
    <b>Cast: </b>${movie.Actors}<br />
  </p>`);
  $(".popup").removeClass("hide");
}
//Close movie info popup
function closePopup(){
  $(".popup").addClass("hide");
}
//Signout re-directs to login page
function signOut(){
  firebase.auth().signOut();
}
async function showWatchlist(){
  //Hide search elements
  $('.search').addClass('hide');
  //Show watchlist elements
  $('.list').removeClass('hide');
  $('#watchlist').insertBefore('#search');
  var db = firebase.firestore();
  var users = db.collection('Users');
  var user = firebase.auth().currentUser;
  var userRef = users.doc(user.uid);

  userRef.get().then((doc)=>{
   if(doc.exists)
   {
     //Store user's watchlist object
     var list = doc.data().watchlist;
     //Output string to store html which will be added to page
     let output = '';
     $('#moviesList').empty();
     $.each(list, async function(index,movie){
       //Iterate through objects in the watchlist, adding HTML representations of each object to the output string
       //replaceAll function is used to replace apostrophes with HTML char coding for apostrophes, to avoid errors when plot descriptions containing apostrophes are added to HTML within onClick='' expressions
       let thisMovie = await getMovieByID(movie.imdbID);
       
       output += `
       <div class="col-md-3 movie">
         <div class="well text-center">
           <h5>${thisMovie.Title}</h5>
           <img class = "poster" src = "${thisMovie.Poster}";>
           <button onClick=\'showDetails(${JSON.stringify(thisMovie).replaceAll('\'','&#39;')})\'>Movie Details</button>
           <button onClick=\'removeFromList(${JSON.stringify(thisMovie).replaceAll('\'','&#39;')})\'>Remove from Watchlist</button>
         </div>
       </div>`;

       $('#moviesList').html(output);
     });
   }
  });
}
function showSearch(){
  //Hide watchlist elements, show search elements
  $('.list').addClass('hide');
  $('.search').removeClass('hide');
  $('#search').insertBefore('#watchlist');
}

function removeFromList(movie){
  var db = firebase.firestore();
  var users = db.collection('Users');
  var user = firebase.auth().currentUser;
  var userRef = users.doc(user.uid);
  //Remove movie object from watchlist array in firestore
  userRef.update({
    watchlist: firebase.firestore.FieldValue.arrayRemove(movie)
  });
  //Alert user
  alert("Removed from list.");
  //Reload watchlist
  showWatchlist();
}
