class Carousel {
  constructor(element, properties) {
    this.board = element;
    this.properties = properties;

    this.curProperty = 0;
    this.prevProperty = this.getPrevProperty();
    this.nextProperty = this.getNextProperty();

    // add first two cards
    this.push(this.curProperty);
    this.push(this.nextProperty);

    // update first property data
    this.updateProperty();

    // handle gestures
    this.handle();
  }

  getPrevProperty() {
    if(this.curProperty == 0) {
      this.prevProperty = this.properties.length - 1;
    } else {
      this.prevProperty = this.curProperty + 1;
    }
    return this.prevProperty;
  }

  getNextProperty() {
    if(this.curProperty == this.properties.length - 1) {
      this.nextProperty = 0;
    } else {
      this.nextProperty = this.curProperty + 1;
    }
    return this.nextProperty;
  }

  handle() {
    // list all cards
    this.cards = this.board.querySelectorAll(".card");

    // get top card
    this.topCard = this.cards[this.cards.length - 1];

    // get next card
    this.nextCard = this.cards[this.cards.length - 2];

    // if at least one card is present
    if (this.cards.length > 0) {
      // set default top card position and scale
      this.topCard.style.transform =
        "translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)";

      // destroy previous Hammer instance, if present
      if (this.hammer) this.hammer.destroy();

      // listen for tap and pan gestures on top card
      this.hammer = new Hammer(this.topCard);
      this.hammer.add(new Hammer.Tap());
      this.hammer.add(
        new Hammer.Pan({
          position: Hammer.position_ALL,
          threshold: 0
        })
      );

      // pass events data to custom callbacks
      this.hammer.on("tap", e => {
        this.onTap(e);
      });
      this.hammer.on("pan", e => {
        this.onPan(e);
      });
    }
  }

  onTap(e) {
    // get finger position on top card
    let propX =
      (e.center.x - e.target.getBoundingClientRect().left) /
      e.target.clientWidth;

    // get degree of Y rotation (+/-15 degrees)
    let rotateY = 15 * (propX < 0.05 ? -1 : 1);

    // change the transition property
    this.topCard.style.transition = "transform 100ms ease-out";

    // rotate
    this.topCard.style.transform =
      "translateX(-50%) translateY(-50%) rotate(0deg) rotateY(" +
      rotateY +
      "deg) scale(1)";

    // wait transition end
    setTimeout(() => {
      // reset transform properties
      this.topCard.style.transform =
        "translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)";
    }, 100);
  }

  onPan(e) {
    if (!this.isPanning) {
      this.isPanning = true;

      // remove transition properties
      this.topCard.style.transition = null;
      if (this.nextCard) this.nextCard.style.transition = null;

      // get top card coordinates in pixels
      let style = window.getComputedStyle(this.topCard);
      let mx = style.transform.match(/^matrix\((.+)\)$/);
      this.startPosX = mx ? parseFloat(mx[1].split(", ")[4]) : 0;
      this.startPosY = mx ? parseFloat(mx[1].split(", ")[5]) : 0;

      // get top card bounds
      let bounds = this.topCard.getBoundingClientRect();

      // get finger position on top card, top (1) or bottom (-1)
      this.isDraggingFrom =
        e.center.y - bounds.top > this.topCard.clientHeight / 2 ? -1 : 1;
    }

    // calculate new coordinates
    let posX = e.deltaX + this.startPosX;
    let posY = e.deltaY + this.startPosY;

    // get ratio between swiped pixels and the axes
    let propX = e.deltaX / this.board.clientWidth;
    let propY = e.deltaY / this.board.clientHeight;

    // get swipe direction, left (-1) or right (1)
    let dirX = e.deltaX < 0 ? -1 : 1;

    // calculate rotation, between 0 and +/- 45 deg
    let deg = this.isDraggingFrom * dirX * Math.abs(propX) * 45;

    // calculate scale ratio, between 95 and 100 %
    let scale = (95 + 5 * Math.abs(propX)) / 100;

    // move top card
    this.topCard.style.transform =
      "translateX(" +
      posX +
      "px) translateY(" +
      posY +
      "px) rotate(" +
      deg +
      "deg) rotateY(0deg) scale(1)";

    // scale next card
    if (this.nextCard)
      this.nextCard.style.transform =
        "translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(" +
        scale +
        ")";

    if (e.isFinal) {
      this.isPanning = false;

      let successful = false;

      // set back transition properties
      this.topCard.style.transition = "transform 200ms ease-out";
      if (this.nextCard)
        this.nextCard.style.transition = "transform 100ms linear";

      // check threshold
      if (propX > 0.25 && e.direction == Hammer.DIRECTION_RIGHT) {
        successful = true;
        // get right border position
        posX = this.board.clientWidth;
      } else if (propX < -0.25 && e.direction == Hammer.DIRECTION_LEFT) {
        successful = true;
        // get left border position
        posX = -(this.board.clientWidth + this.topCard.clientWidth);
      } else if (propY < -0.25 && e.direction == Hammer.DIRECTION_UP) {
        successful = true;
        // get top border position
        posY = -(this.board.clientHeight + this.topCard.clientHeight);
      }

      if (successful) {
        // throw card in the chosen direction
        this.topCard.style.transform =
          "translateX(" +
          posX +
          "px) translateY(" +
          posY +
          "px) rotate(" +
          deg +
          "deg)";

        // wait transition end
        setTimeout(() => {
          // remove swiped card
          this.board.removeChild(this.topCard);

          // reset current and next
          this.curProperty = this.nextProperty;
          this.nextProperty = this.getNextProperty();
          // console.log(this.curProperty);

          // update data for new property
          this.updateProperty();

          // add new card // add the next one since inserting below the top card
          this.push(this.nextProperty);

          // handle gestures on new top card
          this.handle();
        }, 200);
      } else {
        // reset cards position
        this.topCard.style.transform =
          "translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)";
        if (this.nextCard)
          this.nextCard.style.transform =
            "translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(0.95)";
      }
    }
  }

  updateProperty() {
    // set description
    properties[this.curProperty].description();

    // set photo credit
    let imageCredit = document.getElementById('imageCredit');
    imageCredit.textContent = properties[this.curProperty].imageCredit;

    // reset availability
    let propertyId = document.getElementById('propertyId');
    propertyId.value = this.curProperty;
    let calendar = document.getElementById('calendar');
    calendar.value = '';
    let isAvailable = document.querySelector('#isAvailable');
    isAvailable.setAttribute('class', '');
    isAvailable.textContent = '';

    // if superhost, show that rating
    if(properties[this.curProperty].superhost) {
      properties[this.curProperty].superHostRating();
    }
  }

  push(propertyKey) {
    let card = document.createElement("div");
    card.classList.add("card");

    card.style.backgroundImage =
      "url('img/" + properties[propertyKey].image + "')";
      // "url('https://picsum.photos/320/320/?random=" +
      // Math.round(Math.random() * 1000000) +
      // "')";

    if (this.board.firstChild) {
      this.board.insertBefore(card, this.board.firstChild);
    } else {
      this.board.append(card);
    }
  }
}

/*
// ---------------------------------
// attempt to inherit Carousel class
// ---------------------------------
class MyCarousel extends Carousel {
  constructor(element, images) {
    super(element);
    this.images = images;

  }

  // override push() function to allow insert our own images
  push() {
    let card = document.createElement("div");
    card.classList.add("card");

    card.style.backgroundImage =
      "url('/img/" + this.images[0] + "')"; // issue here, doesn't recognize this.images

    if (this.board.firstChild) {
      this.board.insertBefore(card, this.board.firstChild);
    } else {
      this.board.append(card);
    }
  }
}
*/
