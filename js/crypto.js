//initialize an empty array to hold favorite coins' symbols
const favorites = [];

//initialize a variable interval as an undefined value
let interval;

/*
This function toggles the favorite symbol. If it already exists in the favorites array, 
it gets removed from the array. Otherwise, it gets added to the array.
*/
function toggleFromFavorites(symbol) {
  const index = favorites.findIndex((favorite) => symbol === favorite);
  if (index !== -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(symbol);
  }
}

/*
This function sets all checkboxes to unchecked, and then checks only the boxes 
corresponding to the favorites array elements.
*/
function setInitialFavorites() {
  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach((el) => (el.checked = false));

  for (const favorite of favorites) {
    const checkbox = document
      .getElementById(favorite)
      .querySelector('input[type="checkbox"]');
    if (checkbox !== null) {
      checkbox.checked = true;
    }
  }
}

/*
This function saves the favorites array in localStorage under the key "favorites"
*/
function saveFavorite() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

/*
This function retrieves the favorites array from localStorage under the key "favorites"
*/
function loadFavorites() {
  const data = localStorage.getItem("favorites");
  if (data) {
    favorites.push(...JSON.parse(data));
  }
}
loadFavorites();

/*
This function is called when the user clicks on the home button. It clears the interval 
variable if it exists, sends an API request to get all coins from CoinGecko, and then 
renders the cards with renderCards function.
*/
function home() {
  clearInterval(interval);

  $.ajax({
    url: "https://api.coingecko.com/api/v3/coins/",
    beforeSend: function () {
      $("#loadingProgressBar").show();
    },
    complete: function () {
      $("#loadingProgressBar").hide();
    },
    success: (coins) => {
      renderCards(coins);
    },
    error: (err) => alert("error" + err),
  });

  /*
  This function handles the toggling of a switch. If the clicked symbol is already in 
  favorites, the function calls toggleFromFavorites and saveFavorite. Otherwise, if 
  favorites already contains 5 symbols, it opens a modal that allows the user to swap 
  out a favorite with the current symbol. If the modal is closed by clicking the "x" 
  or "Cancel" button, setInitialFavorites is called to revert the checkboxes to their 
  initial values.
  */
  function handleClickOnSwitch() {
    const symbol = this.closest(".card").id;

    if (favorites.includes(symbol)) {
      toggleFromFavorites(symbol);
      saveFavorite();
    } else {
      if (favorites.length < 5) {
        toggleFromFavorites(symbol);
        saveFavorite();
      } else {
        document
          .getElementById(symbol)
          .querySelector('input[type="checkbox"]').checked = false;

        const modalBody = favorites
          .map((favorite) => {
            return `
          <div class="favorite-line">
            <div>${favorite}</div>
            <div class="custom-control custom-switch">
              <label class="switch">
                <input type="checkbox" checked>
                <span class="slider round" id="${favorite}"></span>
              </label>
            </div>
          </div>`;
          })
          .join("");

        $("#favoritesModal .modal-body").html(modalBody);
        $("#favoritesModal .slider").on("click", (e) => {
          toggleFromFavorites(e.target.id);
          toggleFromFavorites(symbol);
          saveFavorite();
          $("#favoritesModal").modal("hide");
        });
        $("#favoritesModal").modal("show");
        $("#favoritesModal").on("hidden.bs.modal", function (e) {
          setInitialFavorites();
        });
      }
    }
  }

  // Define a function that renders the cards based on the provided coins data
  function renderCards(coins) {
    // Clear the contents of the main element and add a div with class 'crypto-grid' and id 'card'
    $("main").html('<div class="crypto-grid" id="card"></div>');
    // Loop through each coin in the provided array
    for (let i = 0; i < coins.length; i++) {
      // Create a card div with an id set to the symbol of the current coin and add a toggle switch and other info about the coin
      let card = `
        <div id="${coins[i].symbol}" class="card">
          <div class="card-body">
            <div class="custom-control custom-switch">
              <label class="switch">
                <input type="checkbox">
                <span class="slider round" is_clicked='false' id="${i}"></span>
              </label>
            </div>
            <h5 class="card-title">${coins[i].symbol}</h5>
            <p class="card-text">${coins[i].name}</p>
            <p>
              <a id="moreInfoBtn" class="btn btn-primary" data-toggle="collapse" href="#collapseExample${i}">
                More Info
              </a>
            </p>
            <div class="collapse" id="collapseExample${i}">
              <div class="card-body">
                <div id="imageCards">
                  <img id="coinsIMG" src="${coins[i].image.small}">
                </div>
                <div>Currency Prices:<br>
                  USD: $${coins[
                    i
                  ].market_data.current_price.usd.toLocaleString()}<br>
                  EUR: €${coins[
                    i
                  ].market_data.current_price.eur.toLocaleString()}<br>
                  ILS: ₪${coins[
                    i
                  ].market_data.current_price.ils.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      // Add the created card to the 'crypto-grid' div
      $(".crypto-grid").append(card);
    }
    // Set the initial favorites and add a click event listener to the toggle switches
    setInitialFavorites();
    $(".slider").on("click", handleClickOnSwitch);
  }

  // Shows the user's searched coin, full name only
  $(document).ready(function () {
    $("#submitButton").on("click", function () {
      var coinName = $("#cName").val();
      if (coinName) {
        $("#loadingProgressBar").show();
        $.ajax({
          url:
            "https://api.coingecko.com/api/v3/coins/" + coinName.toLowerCase(),
          type: "GET",
          dataType: "json",
          success: function (data) {
            renderCards([data]);
          },
          complete: function (xhr, status) {
            $("#loadingProgressBar").hide();
          },
        });
      }
    });
  });

  // Define a click event listener for the submit button
  $("#submitButton").on("click", function (e) {
    // Prevent the default form submission behavior
    e.preventDefault();
    // Get the value of the input field with id 'cName'
    const inputData = $("#cName").val();
    // Send a GET request to the CoinGecko API with the input data to search for coins
    $.ajax({
      url: `https://api.coingecko.com/api/v3/search?query=${inputData}`,
      // Show a loading progress bar while the request is being sent
      beforeSend: function () {
        $("#loadingProgressBar").show();
      },
      // Hide the loading progress bar when the request is complete
      complete: function () {
        $("#loadingProgressBar").hide();
      },
      // If the request is successful, get the data for the first coin in the response and create a card with its info
      success: function (response) {
        if (response.coins.length == 0) {
          // If no coins are found, show an alert and return
          alert("No coin found");
          return;
        }
        // making a GET request to the API to get the data for the first favorite currency in the array
        $.ajax({
          url: `https://api.coingecko.com/api/v3/coins/${favorites[0]}`,
          success: (response) => {
            // emptying the #card div to make sure we're not adding multiple cards
            $("#card").empty();

            // appending a new card element to the #card div with the relevant data from the API response
            $("#card").append(`
        <div class="card" style="width: 18rem;  border: 1px solid black ;display: block; margin-left: auto; margin-right: auto">
          <div class="card-body">
            <div class="toggle">
              <label class="switch">
                <input type="checkbox">
                <span class="slider round"></span>
              </label>
            </div>
            <h5 class="card-title">${response.symbol}</h5>
            <p class="card-text">${response.id}</p>

            <button class="btn btn-primary btnInfo" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample" style="; border: 1px solid black;; color: "white">More Info</button>
            <div class="collapse" id="collapseExample">
              <div class="card card-body coinInfo">
                <p><img src="${response.image.small}" alt="coinImg"></p>
                <div>Currency Prices:<br>
                  <p class="card-text">  USD: ${response.market_data.current_price.usd} $</p>
                  <p class="card-text"> EUR: ${response.market_data.current_price.eur} €</p>
                  <p class="card-text"> ILS: ${response.market_data.current_price.ils} ₪</p>
                </div>
              </div>
            </div>
          </div>
        </div>  
      `);
          },
        });
      },
      error: (err) => {
        // alerting the user in case there was an error in the API request
        alert(err.message);
      },
    });
  });
}
$(home);

// createAboutPage function that clears the interval and creates a simple about page
const createAboutPage = () => {
  clearInterval(interval);
  $("main")
    .html(
      "<div>My name is Arik Korotetski, I am 23 years old and I live in Ashdod. <br> This crypto project was created using HTML, Javascript and CSS with jQuery and AJAX. <br> The site site provides real-time cryptocurrency information through an API request. Users can view various coins and select up to 5 that they are interested in tracking. <br> If they try to select more than 5, they will be prompted to deselect one. Once selected, users can view the price, market cap, and other key information for each coin they have chosen. On top of that, the site also allows the users to watch a graph that's updated in real-time every 5 seconds that shows the user's chosen coins and their prices. <br> I hope you enjoy using the website! <br> <br> <img src='img/arik.jpg' style='width: 15%'</div>"
    )
    .addClass("about-section");
};

// createChartPage function that creates the chart element and fetches the data to display on it
const createChartPage = () => {
  const currencyData = {};
  $("main").html(
    `<div id="chartContainer" style="height: 300px; width: 100%"></div>`
  );

  const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${favorites.join(
    ","
  )}&tsyms=USD`;

  fetchAndCreateChart();
  interval = setInterval(fetchAndCreateChart, 5000);
  // Function to fetch data and create chart
  async function fetchAndCreateChart() {
    // Fetch data using fetchData() function and await its response
    const data = await fetchData();

    // Loop through data and create chart data for each currency
    for (const [key, value] of Object.entries(data)) {
      // Check if currencyData object already has an array for the current currency
      if (!currencyData[key]) {
        currencyData[key] = [];
      }
      // Add new data point to currencyData array for the current currency
      currencyData[key].push({ date: new Date(), value: value["USD"] });
    }

    // Create chart using the createChart() function
    createChart(currencyData);
  }

  // Function to fetch data
  async function fetchData() {
    // Make a fetch request to the URL and await its response
    const response = await fetch(url);
    // Convert the response to JSON and return it
    const data = await response.json();
    return data;
  }

  // Function to create chart using CanvasJS library
  function createChart(currencyData) {
    // Initialize an empty array to store chart data
    const chartData = [];

    // Define date format for x-axis labels
    const dateFormat = "hh:mm:ss";

    // Loop through currencyData and create chart data for each currency
    for (const [key, value] of Object.entries(currencyData)) {
      chartData.push({
        type: "line",
        showInLegend: true,
        name: key,
        markerType: "square",
        xValueFormatString: dateFormat,
        color: "#F08080",
        dataPoints: value.map((item) => ({ x: item.date, y: item.value })),
      });
    }

    // Define chart options object
    var options = {
      animationEnabled: true,
      theme: "light2",
      title: {
        text: "Favorite currencies live reports (updated every 5 seconds)",
      },
      axisX: {
        valueFormatString: dateFormat,
      },
      axisY: {
        title: "USD",
        //suffix: "K",
        minimum: 30,
      },
      toolTip: {
        shared: true,
      },
      legend: {
        cursor: "pointer",
        verticalAlign: "bottom",
        horizontalAlign: "left",
        //dockInsidePlotArea: true,
      },
      data: chartData,
    };

    // Create chart using the CanvasJSChart() function and pass the options object
    $("#chartContainer").CanvasJSChart(options);
  }
};

// Add click event listeners to HTML elements
document.getElementById("about-page").onclick = createAboutPage;
document.getElementById("chart-page").onclick = createChartPage;
document.getElementById("btnHome").onclick = home;
