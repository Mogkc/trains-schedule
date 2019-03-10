//Initialize Firebase
var config = {
    apiKey: "AIzaSyCQ74Zhi3j2BFOzVzonjByinN7ZRUq8po0",
    authDomain: "blindly-accept-c-c-terms.firebaseapp.com",
    databaseURL: "https://blindly-accept-c-c-terms.firebaseio.com",
    projectId: "blindly-accept-c-c-terms",
    storageBucket: "blindly-accept-c-c-terms.appspot.com",
    messagingSenderId: "517996222111"
};
firebase.initializeApp(config);
var trainData = firebase.database();

$("#add-train").on("click", function (event) {
    event.preventDefault();

    //Update the Database, which triggers the function below
    trainData.ref("/trains").push({
        name: $("#name-input").val().trim(),
        destination: $("#destination-input").val().trim(),
        startTrain: $("#time-input").val().trim(),
        frequency: $("#freq-input").val().trim()
    });

    //Clear the input fields
    $("#name-input").val("");
    $("#destination-input").val("");
    $("#time-input").val("");
    $("#freq-input").val("");
});

//When there's a new record, it's added to the table
trainData.ref("/trains").on("child_added", function (snapshot) {
    var row = $("<tr>");
    row.append($("<th>").text(snapshot.val().name));
    row.append($("<th>").text(snapshot.val().destination));
    row.append($("<th>").text(snapshot.val().frequency));
    //Calculate Next arrival and minutes away
    var next = nextTrain(snapshot.val().startTrain, snapshot.val().frequency);
    row.append($("<th>").text(next.at));
    row.append($("<th>").text(next.minAway));

    $("#train-display").append(row);
});

var nextTrain = function (starting, freq) {
    //Because of HTML input type formatting, no matter what the user
    //inputs we recieve military time.
    var startMoment = moment(starting, ['H:m']);
    var now = moment();
    var differenceFromNow = startMoment.diff(now, 'minutes');
    //If the starting time is in the past,
    //Increace startMoment by the frequency until it is in the future
    if (differenceFromNow < 0) {
        var trainsAlreadyPassed = 0 - Math.floor(differenceFromNow / freq);
        startMoment.add((trainsAlreadyPassed * freq), 'minutes');
        //and update differenceFromNow.
        //JS modulo returns negative for negative starting values...
        differenceFromNow = startMoment.diff(now, 'minutes');
    }
    return {
        at: startMoment.format('h:mm A'),
        minAway: differenceFromNow
    };
}