let images = [
  "./images/photo1.jpg",
  "./images/photo3.avif",
  "./images/photo4.avif",
];

let i = 0;

setInterval(() => {
  i++;
  if (i >= images.length) i = 0;
  document.getElementById("slider").src = images[i];
}, 3000);

const catUrl = "https://restaurant.stepprojects.ge/api/Categories/GetAll";
const prodUrl = "https://restaurant.stepprojects.ge/api/Products/GetAll";

let products = [];
let categories = [];
let currentCategory = 0;

async function getCategories() {
  const res = await fetch(catUrl);
  categories = await res.json();

  let html = `<button class="active" onclick="filterCategory(0, event)">All</button>`;

  categories.forEach((cat) => {
    html += `<button onclick="filterCategory(${cat.id}, event)">${cat.name}</button>`;
  });

  document.getElementById("categories").innerHTML = html;
}

async function getProducts() {
  const res = await fetch(prodUrl);
  products = await res.json();
  renderProducts(products);
}

function renderProducts(list) {
  let html = "";

  list.forEach((p) => {
    html += `
<div class="card">

<img src="${p.image}" />

<div class="card-body">

<h3>${p.name}</h3>

<p>Spiciness: ${p.spiciness}</p>

<p class="price">$ ${p.price}</p>

<button class="add" onclick="addToCart(${p.id})">Add to cart</button>

</div>

</div>
`;
  });

  document.getElementById("products").innerHTML = html;
}

getCategories();
getProducts();

function filterCategory(id, event) {
  currentCategory = id;

  document
    .querySelectorAll(".categories button")
    .forEach((btn) => btn.classList.remove("active"));

  event.target.classList.add("active");

  applyFilter();
}

const spice = document.getElementById("spice");
const spiceValue = document.getElementById("spiceValue");

spiceValue.textContent = "Not Chosen";

spice.addEventListener("input", () => {
  let val = Number(spice.value);

  if (val === 0) {
    spiceValue.textContent = "Not Chosen";
  } else {
    spiceValue.textContent = val - 1;
  }
});

function applyFilter() {
  let spiceSlider = Number(document.getElementById("spice").value);
  let spiceLevel = spiceSlider - 1;

  let noNuts = document.getElementById("nuts").checked;
  let vegetarian = document.getElementById("vegetarian").checked;

  let filtered = products.filter((p) => {
    if (currentCategory !== 0 && p.categoryId !== currentCategory) return false;

    // ეს არის მთავარი გასწორება
    if (spiceSlider !== 0 && p.spiciness !== spiceLevel) return false;

    if (noNuts && p.nuts) return false;

    if (vegetarian && !p.vegetarian) return false;

    return true;
  });

  renderProducts(filtered);
}
document.getElementById("apply").addEventListener("click", applyFilter);

document.getElementById("reset").addEventListener("click", () => {
  document.getElementById("spice").value = 0;
  document.getElementById("spiceValue").textContent = "Not Chosen";

  document.getElementById("nuts").checked = false;
  document.getElementById("vegetarian").checked = false;

  currentCategory = 0;

  document
    .querySelectorAll(".categories button")
    .forEach((btn) => btn.classList.remove("active"));

  document.querySelector(".categories button").classList.add("active");

  renderProducts(products);
});



function showMessage() {
  let msg = document.createElement("div");

  msg.innerText = "Product added to cart";

  msg.className = "cartMessage";

  document.body.appendChild(msg);

  setTimeout(() => {
    msg.remove();
  }, 1000);
}

async function addToCart(id) {

  await fetch("https://restaurant.stepprojects.ge/api/Baskets/AddToBasket", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: id,
      quantity: 1,
    }),
  });

  showMessage();
}
