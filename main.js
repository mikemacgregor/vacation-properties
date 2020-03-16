// COMP1073 Module 3 Project, Vacation Rental Properties
// Mike MacGregor #200232817
// March 16, 2020

// --------------------
// main Property object
// --------------------
function Property(name, price, rating, location, rooms, datesBooked, features, image, imageCredit) {
  this.name = name;
  this.price = price;
  this.rating = rating;
  this.location = location;
  this.rooms = rooms;
  this.datesBooked = datesBooked;
  this.features = features;
  this.image = image;
  this.imageCredit = imageCredit;
}

// display description
Property.prototype.description = function() {
  let description = document.querySelector('#description');

  // clear existing
  let existingDiv = description.querySelector('div');
  if(existingDiv) {
    description.innerHTML = '';
  }

  // name of the property
  let h2 = document.createElement('h2');
  h2.textContent = this.name + ' ';

  // bootstrap badge inside the name heading to display property rating
  let rating = document.createElement('span');
  rating.setAttribute('class', 'badge badge-primary');
  rating.textContent = this.rating;
  h2.appendChild(rating);

  // put price, location, rooms in a list
  let items = ['price', 'location', 'rooms'];
  let ul = document.createElement('ul');
  ul.setAttribute('class', 'list-group');
  for(let x = 0; x < items.length; x++) {
    let li = document.createElement('li');
    li.setAttribute('class', 'list-group-item');
    li.textContent = items[x].toUpperCase() + ': ';
    if(items[x] == 'price') {
      if (this.discountPrice() < this[items[x]]) {
        li.appendChild(formatPrice(this[items[x]], 1));
        li.appendChild(formatPrice(this.discountPrice(), 0));
        let sale = document.createElement('span');
        sale.setAttribute('class', 'badge badge-success');
        sale.innerHTML = '<big><big>SALE</big></big>';
        // sale.textContent = 'SALE';
        li.appendChild(sale);
      } else {
        li.appendChild(formatPrice(this[items[x]], 0));
      }
    } else if(items[x] == 'rooms' && this[items[x]] == 1) {
      li.textContent += 'Open concept'; // single room
    } else {
      li.textContent += this[items[x]]; // everything else as-is
    }
    ul.appendChild(li);
  }

  // features in a horizonal list ... might need to adjust if have more features
  li = document.createElement('li');
  li.setAttribute('class', 'list-group-item');
  li.textContent = 'FEATURES: ';
  ul.appendChild(li);
  let featuresList = document.createElement('ul');
  featuresList.setAttribute('class', 'list-group list-group-horizontal');
  for(x = 0; x < this.features.length; x++) {
    li = document.createElement('li');
    li.setAttribute('class', 'list-group-item m-1 p-2 border border-primary rounded-lg');
    li.textContent += this.features[x];
    featuresList.appendChild(li);
  }
  ul.appendChild(featuresList);

  // put it all together
  let div = document.createElement('div');
  div.setAttribute('class', 'propertyInfo');
  div.appendChild(h2);
  div.appendChild(ul);

  description.appendChild(div);
};

// check if property is available // is date is in "datesBooked", then it is not available
Property.prototype.isAvailable = function(checkDate) {
  for(let d = 0; d < this.datesBooked.length; d++) {
    if(this.datesBooked[d] == checkDate) {
      return 0;
    }
  }
  // exited the loop, so is available
  return 1;
};

// ---------------------
// Special Rate Property
// ---------------------
function SpecialRateProperty(name, price, rating, location, rooms, datesBooked, features, image, imageCredit, discount) {
  Property.call(this, name, price, rating, location, rooms, datesBooked, features, image, imageCredit);
  this.discount = discount; // discount should be input as decimal, i.e. 20% = 0.2

}

// inherit existing methods
SpecialRateProperty.prototype = Property.prototype;

// calculate discounted price method
SpecialRateProperty.prototype.discountPrice = function() {
  let discountPrice = this.price - (this.price * Math.abs(this.discount));
  return discountPrice;
}

// -------------------
// Super Host Property
// -------------------
function SuperHostProperty(name, price, rating, location, rooms, datesBooked, features, image, imageCredit) {
  Property.call(this, name, price, rating, location, rooms, datesBooked, features, image, imageCredit);
  this.superhost = 1;

}

// inherit existing methods
SuperHostProperty.prototype = Property.prototype;

// add superhost label below description
SuperHostProperty.prototype.superHostRating = function() {
  let description = document.querySelector('#description');

  let superhost = document.createElement('div');
  superhost.setAttribute('id', 'superhost');

  let badge = document.createElement('div');
  badge.setAttribute('class', 'alert alert-success');
  badge.textContent = 'This is a Super Host property!';

  let whatIs = document.createElement('a');
  whatIs.setAttribute('href', 'https://www.airbnb.ca/help/article/828/what-is-a-superhost');
  whatIs.textContent = 'What is a Super Host?';

  superhost.appendChild(badge);
  superhost.appendChild(whatIs);

  description.appendChild(superhost);
}

// ----------------
// helper functions
// ----------------
function checkAvailability(e) {
  let propertyId = document.getElementById('propertyId').value;
  let selectedDate = document.getElementById('calendar').value;
  let isAvailable = document.querySelector('#isAvailable');
  isAvailable.removeAttribute('class');
  if(properties[propertyId].isAvailable(selectedDate) == 1) {
    isAvailable.setAttribute('class', 'alert alert-success');
    isAvailable.textContent = 'Great news! This property is available on that day';
  } else {
    isAvailable.setAttribute('class', 'alert alert-warning');
    isAvailable.textContent = 'Sorry! This property is not available on that day';
  }

}

function formatPrice(amount, discounted) {
  let price = document.createElement('span');
  if(discounted == 1) {
    price.setAttribute('class', 'oldPrice');
  }
  price.textContent = '$' + amount + ' ';
  return price;
}

// add eventListener to calendar
let calendar = document.getElementById('calendar');
calendar.addEventListener('change', checkAvailability);

// ---------------------
// Available Properties
// ---------------------

// cottages-in-the-middle-of-beach-753626.jpg // Photo by Julius Silver from Pexels
// white-house-near-body-of-water-1438834.jpg // Photo by Frans Van Heerden from Pexels
// white-and-green-high-rise-building-3526084.jpg // Photo by Mark Neal from Pexels
// building-with-tree-1534057.jpg // Photo by James Wheeler from Pexels
// architecture-clouds-daylight-driveway-259588.jpg // Photo by Pixabay from Pexels
// brown-brick-high-rise-mansion-3371246.jpg // Photo by Johannes Rapprich from Pexels
// white-and-red-wooden-house-with-fence-1029599.jpg // Photo by Scott Webb from Pexels

// name, price, rating, location, rooms, availability (dates booked), features, image, imageCredit

let rentalOne = new Property('Cottage on the Water', 2000, 4.5, 'Tropical Paradise, Bahamas', 1, ['2020-03-17', '2020-03-19'],
['beautiful view', 'coffee maker', 'one hammock to fight over'],
'cottages-in-the-middle-of-beach-753626.jpg', 'Photo by Julius Silver from Pexels');

let rentalTwo = new Property('Reflecting White House', 1500, 4.2, 'Washington, U.S.A.', 6, ['2020-03-18'],
['water front', 'slushy machine', 'close to golf course'],
'white-house-near-body-of-water-1438834.jpg', 'Photo by Frans Van Heerden from Pexels');

let rentalThree = new SpecialRateProperty('Castle in the Woods', 1800, 4.4, 'Edinburgh, Scotland', 50, ['2020-03-19'],
['great for social distancing', 'Meghan Markle stayed here'],
'white-and-green-high-rise-building-3526084.jpg', 'Photo by Mark Neal from Pexels', 0.2);

let rentalFour = new SuperHostProperty('Garden of Eden', 1750, 4.6, 'Bucharest, Romania', 9, ['2020-03-19', '2020-03-20'],
['unique property', 'scenic escape', 'built-in treehouse for kids'],
'building-with-tree-1534057.jpg', 'Photo by James Wheeler from Pexels');

let rentalFive = new SpecialRateProperty('Family Home', 1400, 4.1, 'Barrie, Ontario', 7, ['2020-03-20', '2020-03-21', '2020-03-22'],
['wood fireplace', 'walking distance to Tim Horton\'s', 'Netflix'],
'white-and-red-wooden-house-with-fence-1029599.jpg', 'Photo by Scott Webb from Pexels', 0.2);

let rentalSix = new Property('Xavier\'s Mansion', 2400, 4.8, 'Salem, New York', 35, ['2020-03-25', '2020-03-26'],
['basketball court', 'antique furnishings', 'featured in X-Men movies'],
'brown-brick-high-rise-mansion-3371246.jpg', 'Photo by Johannes Rapprich from Pexels');

// --------------------------
// Initialize Carousel and Go
// --------------------------

let board = document.querySelector('#board');

let properties = [rentalOne, rentalTwo, rentalThree, rentalFour, rentalFive, rentalSix];

let carousel = new Carousel(board, properties);
