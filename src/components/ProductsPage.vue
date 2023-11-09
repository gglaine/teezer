<template>
    <div class="container mx-auto px-4 mt-8">
      <div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
        <div v-for="(product, index) in products" :key="product.id" class="mb-4 break-inside-avoid-column relative">
          <v-lazy-image
            :src="getProductImageUrl(product.localImage)"
            :alt="product.name"
            class="w-full rounded"
            aspect-ratio="1"
          />
          <button @click="toggleCaption(product.id)" class="absolute bottom-2 right-2 bg-slate-700 text-white p-2 rounded-full">+</button>
          <div v-if="visibleCaptions[product.id]" class="px-6 py-4">
        
            <p class="text-slate-500 text-base">
              {{ product.figcaption }}
            </p>
              <!-- Display the price -->
            <p class="text-gray-700 text-base">
                Price: {{ product.price }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  .break-inside-avoid-column {
    break-inside: avoid-column;
  }
  </style>
  
  <script>
  import VLazyImage from 'v-lazy-image';
  
  export default {
    name: 'ProductsPage',
    components: {
      VLazyImage,
    },
    data() {
      return {
        products: [],
        visibleCaptions: {}, // Object to keep track of visible captions
      };
    },
    mounted() {
      this.fetchProducts();
      window.scrollTo(0, 0); // Ensure the window scrolls to the top when the component is mounted
    },
    methods: {
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
      // Extract price using the regular expression
      const figcaptionParts = product.figcaption.split(/\s+Completed\s+/);
      const priceMatch = product.figcaption.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/);
      return {
        ...product,
        id: index, // Assuming index as a unique identifier for each product
        figcaption: figcaptionParts[0],
        price: priceMatch ? priceMatch[0] : 'Price not available'
      };
    });
    // Initialize visibleCaptions for each product
    this.products.forEach(product => {
      this.visibleCaptions[product.id] = false;
    });
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
},


  toggleCaption(productId) {
    if (this.visibleCaptions.hasOwnProperty(productId)) {
      // Directly toggle the visibility state for the caption
      this.visibleCaptions[productId] = !this.visibleCaptions[productId];
    } else {
      // If the productId doesn't exist in the object, add it and set to true
      this.visibleCaptions[productId] = true;
    }
  },
    },
  };
  </script>
  