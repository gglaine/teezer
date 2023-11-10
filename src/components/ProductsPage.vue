<template>
    <div class="container mx-auto px-4 mt-8 ">
			<div v-if="randomFunFact && showFunFact" class="random-fun-fact bg-slate-900 border-l-4 border-blue-500 text-blue-700 p-4 relative">
				<p class="font-light mb-2">Did You Know?</p>
				<div class="flex justify-between items-start">
					<div>
						<p class="font-bold mb-2 mt-2 text-white">{{ randomFunFact.title }}</p>
						<p class="font-light text-white text-2xl">{{ randomFunFact.fact }}</p>
					</div>
					<p class=" text-white text-4xl absolute top-4 right-4">{{ randomFunFact.emoji }}</p>
				</div>
			</div>

      <!-- Flex container for tags and sort button -->
			<div class="flex justify-end items-center mb-4 mt-2">
            <!-- Tags categories -->
            <div class="flex gap-2">
                <!-- Replace these divs with actual tag components or buttons -->
								<div v-for="(tag, index) in uniqueTags" :key="index"
								@click="filterByTag(tag)"
								class="border-b border-slate-400 text-white text-sm p-1 cursor-pointer font-light"
								:class="{ 'selected-tag': tag === selectedTag }">
								{{ tag }}
						</div>
                <!-- ... add more categories as needed -->
            </div>

            <!-- Sort Button -->
            <button @click="toggleSortOrder" class="border-1 border-white text-white text-sm p-2 font-light rounded bg-transparent">
                Value {{ sortOrder === 'ASC' ? '🔽' : '🔼' }}
            </button>
        </div>
      <div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">

        <div v-for="(product, index) in filteredProducts" :key="product.id" @click="openLightbox(product)" class="group cursor-pointer mb-4 break-inside-avoid-column relative max-w-sm rounded overflow-hidden shadow-lg">
            <div class="border border-transparent hover:border-blue-500 transition duration-300 w-full h-full absolute inset-0 rounded group"></div>
            <v-lazy-image
            :src="getProductImageUrl(product.localImage)"
            :alt="product.name"
            class="w-full rounded transform transition duration-300 group-hover:scale-110 relative z-10"
            aspect-ratio="1"
            />
            <button @click.stop="toggleCaption(product.id, $event)" class="absolute bottom-2 right-2 bg-transparent z-50 w-10 text-white p-2 rounded-full">+</button>
            <div  v-if="visibleCaptions[product.id]" class="px-2 py-4 mt-2 text-left">
                <p class="text-slate-500 text-base">{{ product.figcaption }}</p>
                <!-- Display the price -->
                <p class="text-gray-700 text-base mt-3">Sold: ${{ product.price }}</p>
            </div>
        </div>
            <!-- Lightbox Overlay -->
        <div v-if="activeProduct" class="fixed inset-0 bg-slate-900 bg-opacity-50 z-50 flex justify-center items-center">
					<div class="bg-slate-500 p-4 rounded mx-auto relative max-w-full max-h-screen overflow-y-auto">
						<!-- Lightbox Content -->
						<div class="text-right">
								<button @click="closeLightbox" class="text-pink-800 text-2xl">&times;</button>
						</div>
						<div>
								<!-- Display the active product details here -->
								<h2>{{ activeProduct.name }}</h2>
								<img :src="getProductImageUrl(activeProduct.localImage)" :alt="activeProduct.name" class="w-full max-h-[80vh] object-contain">
								<p class="mt-2">{{ activeProduct.figcaption }}</p>
								<p class="text-black text-right text-base font-bold">$ {{ activeProduct.price }}</p>
						</div>
					</div>
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
	.selected-tag {
  background-color: #424547; /* Example blue color */
}
  .break-inside-avoid-column {
    break-inside: avoid-column;
  }
  /* Lightbox Styles */
.fixed {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.bg-random-color::before {
  content: '';
  background-color: var(--backlight-color); /* This custom property should be dynamically set */
  box-shadow: 0 0 8px 8px var(--backlight-color); /* Adjust the spread and blur as needed */
  border-radius: inherit;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1; /* To keep the backlight behind the content */
  transition: transform 0.3s ease-in-out;
}
.group:hover .bg-random-color::before {
  transform: scale(1.05);
}

.random-fun-fact {
  animation: fadeOut 15s forwards;
}
@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    visibility: hidden;
  }
}
  </style>
  
  <script>
  import VLazyImage from 'v-lazy-image';
  
  export default {
    name: 'ProductsPage',
    components: {
      VLazyImage,
    },
		computed: {
    uniqueTags() {
        const allTags = this.products.flatMap(product => product.tags);
        return ['All', ...new Set(allTags)];
    }
},
    data() {
      return {
        products: [],
        activeProduct: null, // Will hold the active product details for the lightbox
        visibleCaptions: {}, // Object to keep track of visible captions
        sortOrder: 'DESC', // Track the sort order, default is 'ASC',
				randomFunFact: null,
				showFunFact: true, // new property to control visibility
				filteredProducts: [],
      };
    },
    mounted() {
        this.fetchProducts();
				this.fetchFunFacts();
				setTimeout(() => {
      this.showFunFact = false;
    }, 5000);
        window.scrollTo(0, 0); // Ensure the window scrolls to the top when the component is mounted
        const cards = document.querySelectorAll('.bg-random-color');
        cards.forEach(card => {
            // Generate a random color
            const randomColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
            // Set the --backlight-color variable for each card
            card.style.setProperty('--backlight-color', randomColor);
        });
    },
    methods: {
        toggleCaption(productId, event) {
            event.stopPropagation(); // Prevent opening the lightbox when toggling the caption
            this.visibleCaptions[productId] = !this.visibleCaptions[productId];
        },
        openLightbox(product) {
        this.activeProduct = product;
        },
        closeLightbox() {
        this.activeProduct = null;
        },
        getProductImageUrl(imageFileName) {
            return `/downloaded_images/${imageFileName}`;
        },
				async fetchProducts() {
				try {
						const response = await fetch('/image-mappings.json');
						if (!response.ok) {
								throw new Error('Network response was not ok: ' + response.statusText);
						}
						const productsData = await response.json();
						this.products = productsData.map((product, index) => {
								// Extract the part of the figcaption before "Completed"
								const figcaptionMatch = product.figcaption.match(/^(.*?)\s+Completed/);
								const cleanedFigcaption = figcaptionMatch ? figcaptionMatch[1].trim() : product.figcaption;

								// Extract price using the regular expression
								const priceMatch = product.figcaption.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/);
								const price = priceMatch ? parseFloat(priceMatch[0].replace(/[$,]/g, '')) : 0; // Convert price to number
							// Dynamically extract tags
							const tags = this.extractTags(product.figcaption);
								return {
										...product,
										id: index, // Assuming index as a unique identifier for each product
										figcaption: cleanedFigcaption,
										price: price,
										tags: tags
								};
						});
						this.sortProducts(); // Initial sort
						this.filteredProducts = this.products;
						console.log(this.products)
					} catch (error) {
							console.error('There has been a problem with your fetch operation:', error);
					}
				},
			extractTags(figcaption) {
					const keywords = ["Vintage", "Disney", "Rare", "No Feet", "Automat"]; // Add more as needed
					return keywords.filter(keyword => figcaption.includes(keyword));
			},
			filterByTag(tag) {
				this.selectedTag = tag;
				if (tag === 'All') {
					this.filteredProducts = this.products;
				} else {
					this.filteredProducts = this.products.filter(product =>
						product.tags.includes(tag));
				}
			},
			  async fetchFunFacts() {
    try {
      const response = await fetch('/pezfacts.json');
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      const funFacts = await response.json();
      this.randomFunFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    } catch (error) {
      console.error('Error fetching fun facts:', error);
    }
  },
      toggleSortOrder() {
        this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
        this.sortProducts();
      },
      sortProducts() {
        if (this.sortOrder === 'ASC') {
          this.products.sort((a, b) => a.price - b.price);
        } else {
          this.products.sort((a, b) => b.price - a.price);
        }
      },
    },
  };
  </script>
  
  