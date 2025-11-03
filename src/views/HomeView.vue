<template>
  <div class="home-view">
    <GlobalNavbar />
    <HeroSection />
    <RegionSection />
    <ClassicsSection />
    <ThinkingSection />
    <ActivitiesSection />
    <AboutUsSection />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import GlobalNavbar from '../components/GlobalNavbar.vue'
import HeroSection from '../components/HeroSection.vue'
import RegionSection from '../components/RegionSection.vue'
import ClassicsSection from '../components/ClassicsSection.vue'
import ThinkingSection from '../components/ThinkingSection.vue'
import ActivitiesSection from '../components/ActivitiesSection.vue'
import AboutUsSection from '../components/AboutUsSection.vue'
import Footer from '../components/Footer.vue'
</script>

<style scoped>
.home-view {
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>