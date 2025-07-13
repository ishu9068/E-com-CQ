// public/js/index.js

const userwelcome = document.querySelector("#username");
const container = document.getElementById("itemsDisplay");
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const itemsPerPage = 5;
let currentPage = 1;

if (!currentUser) {
  alert("User not logged in");
  window.location.href = "login.html";
}

userwelcome.innerHTML = `Welcome ${currentUser.username}`;
const userCartKey = `cartItems_${currentUser.username}`;

function renderPage(page) {
  container.innerHTML = "";
  let cartItems = JSON.parse(localStorage.getItem(userCartKey)) || [];

  fetch("/website-products")
    .then((res) => res.json())
    .then((data) => {
      if (data.status === 1) {
        const allItems = data.products;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = allItems.slice(start, end);

        paginatedItems.forEach((item, indexOnPage) => {
          const realIndex = start + indexOnPage;
          const card = document.createElement("div");
          card.className = "card";
          card.id = `item-${realIndex}`;

          const cartItem = cartItems.find((ci) => ci.name === item.name);
          const quantity = cartItem ? cartItem.quantity : 0;

          card.innerHTML = `
            <h3>${item.name}</h3>
            <p><strong>Price:</strong> ₹${item.price}</p>
            <p><strong>Description:</strong> ${item.description}</p>
            <div class="cartdiv" id="action-${realIndex}">
              ${
                quantity > 0
                  ? `<div class="counter">
                      <button onclick="changeQty(${realIndex}, -1)">-</button>
                      <span id="qty-${realIndex}">${quantity}</span>
                      <button onclick="changeQty(${realIndex}, 1)">+</button>
                    </div>`
                  : `<button onclick="addtocart(${realIndex})">Add to Cart</button>`
              }
            </div>
          `;
          container.appendChild(card);
        });

        document.getElementById("prevBtn").disabled = currentPage === 1;
        document.getElementById("nextBtn").disabled = end >= allItems.length;
        document.getElementById("pagenumber").innerText = `Page ${currentPage}`;
      }
    })
    .catch((err) => {
      alert("Something went wrong.");
      console.error(err);
    });
}

function addtocart(index) {
  fetch("/website-products")
    .then((res) => res.json())
    .then((data) => {
      const item = data.products[index];
      let cartItems = JSON.parse(localStorage.getItem(userCartKey)) || [];
      const existingItemIndex = cartItems.findIndex((ci) => ci.name === item.name);

      if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity += 1;
      } else {
        cartItems.push({ ...item, quantity: 1 });
      }

      localStorage.setItem(userCartKey, JSON.stringify(cartItems));
      updateCounterUI(index);
    });
}

function changeQty(index, change) {
  fetch("/website-products")
    .then((res) => res.json())
    .then((data) => {
      const item = data.products[index];
      let cartItems = JSON.parse(localStorage.getItem(userCartKey)) || [];
      const existingItemIndex = cartItems.findIndex((ci) => ci.name === item.name);

      if (existingItemIndex > -1) {
        if (change > 0 && cartItems[existingItemIndex].quantity >= item.quantity) {
          alert("hamare paas aur stock nahi hai.");
          return;
        }

        cartItems[existingItemIndex].quantity += change;

        if (cartItems[existingItemIndex].quantity <= 0) {
          cartItems.splice(existingItemIndex, 1);
        }

        localStorage.setItem(userCartKey, JSON.stringify(cartItems));
        updateCounterUI(index);
      }
    });
}

function updateCounterUI(index) {
  fetch("/website-products")
    .then((res) => res.json())
    .then((data) => {
      const item = data.products[index];
      let cartItems = JSON.parse(localStorage.getItem(userCartKey)) || [];
      const cartItem = cartItems.find((ci) => ci.name === item.name);
      const actionDiv = document.getElementById(`action-${index}`);

      if (cartItem) {
        actionDiv.innerHTML = `
          <div class="counter">
            <button onclick="changeQty(${index}, -1)">-</button>
            <span id="qty-${index}">${cartItem.quantity}</span>
            <button onclick="changeQty(${index}, 1)">+</button>
          </div>
        `;
      } else {
        actionDiv.innerHTML = `<button onclick="addtocart(${index})">Add to Cart</button>`;
      }
    });
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  currentPage++;
  renderPage(currentPage);
});

renderPage(currentPage);
