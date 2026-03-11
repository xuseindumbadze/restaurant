console.log("JS LOADED");


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


// უპდატეე

const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");

document.getElementById("openLogin").onclick = () => {
loginModal.style.display = "flex";
};

document.getElementById("openRegister").onclick = () => {
registerModal.style.display = "flex";
};

document.getElementById("closeLogin").onclick = () => {
loginModal.style.display = "none";
};

document.getElementById("closeRegister").onclick = () => {
registerModal.style.display = "none";
};

document.getElementById("goRegister").onclick = () => {
loginModal.style.display = "none";
registerModal.style.display = "flex";
};




document.getElementById("loginBtn").onclick = async () => {

let res = await fetch(
"https://api.everrest.educata.dev/auth/sign_in",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email:document.getElementById("loginEmail").value,
password:document.getElementById("loginPassword").value
})
});

let data = await res.json();

localStorage.setItem("token", data.Token);

loginModal.style.display="none";

location.reload(); 

};

function checkAuth(){

let token = localStorage.getItem("token");

if(token){

document.querySelector(".authButtons").innerHTML = `
<span style="color:white;font-size:12px;">Token: ${token.substring(0,20)}...</span>
<button id="logoutBtn">Sign out</button>
`;

document.getElementById("logoutBtn").onclick = () => {

localStorage.removeItem("token");

location.reload();

};

}

}

checkAuth();


document.getElementById("registerBtn").onclick = async () => {

let res = await fetch(
"https://api.everrest.educata.dev/auth/sign_up",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
firstName:document.getElementById("firstName").value,
lastName:document.getElementById("lastName").value,
email:document.getElementById("email").value,
password:document.getElementById("password").value
})
});

let data = await res.json();

alert("Registration successful");

registerModal.style.display="none";

};



  // ==================== AI CHAT ====================
      const API_KEY = "თქვენი-API-KEY-აქ"; // ← შენი key ჩასვი აქ

      let aiOpen = false;
      let restaurantProducts = []; // პროდუქტები API-დან

      // პროდუქტების ჩატვირთვა AI-სთვის
      fetch("https://restaurant.stepprojects.ge/api/Products/GetAll")
        .then(r => r.json())
        .then(data => { restaurantProducts = data; });

      function toggleAI() {
        aiOpen = !aiOpen;
        document.getElementById("aiPanel").classList.toggle("open", aiOpen);
        if (aiOpen) document.getElementById("aiInput").focus();
      }

      function addMessage(text, type) {
        const box = document.getElementById("aiMessages");
        const msg = document.createElement("div");
        msg.className = `ai-msg ${type}`;
        msg.textContent = text;
        box.appendChild(msg);
        box.scrollTop = box.scrollHeight;
        return msg;
      }

      async function sendAI() {
        const input = document.getElementById("aiInput");
        const btn = document.getElementById("aiSendBtn");
        const userText = input.value.trim();
        if (!userText) return;

        addMessage(userText, "user");
        input.value = "";
        btn.disabled = true;

        const loading = addMessage("⏳ ვფიქრობ...", "loading");

        // პროდუქტების მოკლე სია AI-სთვის
        const productList = restaurantProducts.map(p =>
          `- ${p.name} | ფასი: $${p.price} | სიმწარე: ${p.spiciness} | ვეგეტარიანული: ${p.vegetarian ? "კი" : "არა"} | თხილი: ${p.nuts ? "კი" : "არა"}`
        ).join("\n");

        const prompt = `შენ ხარ რესტორნის AI დამხმარე. შენი ამოცანაა დაეხმარო მომხმარებელს კერძების არჩევაში.

**წესები:**
1. გამოიყენე მხოლოდ ქვემოთ მოცემული კერძების სია
2. ყოველთვის უპასუხე ქართულად
3. თუ მომხმარებელი ითხოვს ვეგეტარიანულს - გაუფილტრე ვეგეტარიანული კერძები
4. თუ ითხოვს თხილის გარეშე - გაუჩვენე nuts:არა კერძები
5. მიეცი მოკლე, მეგობრული პასუხი და ურჩიე 2-3 კერძი
6. მიუთითე კერძის სახელი და ფასი

**კერძების სია:**
${productList}

**მომხმარებლის შეკითხვა:** ${userText}`;

        try {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "anthropic-dangerous-direct-browser-access": "true",
              "x-api-key": API_KEY,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-20250514",
              max_tokens: 80,
              messages: [{ role: "user", content: prompt }],
            }),
          });

          const data = await res.json();
          loading.remove();
          addMessage(data.content[0].text, "bot");
        } catch (err) {
          loading.remove();
          addMessage("შეცდომა მოხდა. სცადეთ თავიდან.", "bot");
        }

        btn.disabled = false;
        input.focus();
      }
      // ==================== END AI ====================