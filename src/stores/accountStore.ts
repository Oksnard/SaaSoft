import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Account } from '../types'

export const useAccountStore = defineStore(
  'accounts',
  () => {
    const accounts = ref<Account[]>([])

    const addAccount = (account: Account) => {
      accounts.value.push(account)
    }

    const updateAccount = (id: string, updates: Partial<Account>) => {
      const index = accounts.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        accounts.value[index] = { ...accounts.value[index], ...updates }
      }
    }

    const deleteAccount = (id: string) => {
      accounts.value = accounts.value.filter((account) => account.id !== id)
    }

    const getAccountById = (id: string) => {
      return accounts.value.find((a) => a.id === id)
    }

    const accountCount = computed(() => accounts.value.length)

    return {
      accounts,
      addAccount,
      updateAccount,
      deleteAccount,
      getAccountById,
      accountCount,
    }
  },
  {
    persist: true,
  }
)
