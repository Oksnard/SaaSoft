<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-title class="text-h5 font-weight-bold"
        >Управление учетными записями</v-app-bar-title
      >
    </v-app-bar>

    <v-main>
      <v-container class="py-8">
        <AccountList />
        <AddAccountForm />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AccountList from './components/AccountList.vue'
import AddAccountForm from './components/AddAccountForm.vue'
</script>
