<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6">Учетные записи</span>
      <v-btn color="primary" @click="openAddForm" variant="elevated"> + </v-btn>
    </v-card-title>

    <v-card-text>
      <div v-if="accounts.length === 0" class="text-center py-12 text-grey-darken-1">
        Нет добавленных учетных записей
      </div>

      <div v-else class="space-y-4">
        <v-card v-for="account in accounts" :key="account.id" variant="outlined" class="mb-4">
          <v-card-text>
            <div class="grid-container">
              <div class="field-group">
                <label class="field-label">Метки</label>
                <v-text-field
                  :value="getLabelsAsString(account.label)"
                  @change="(e) => updateAccountLabels(account.id, (e as any).target?.value || '')"
                  variant="outlined"
                  density="compact"
                  maxlength="50"
                  placeholder="Введите метки через ;"
                  hide-details
                />
              </div>

              <div class="field-group">
                <label class="field-label">Тип записи</label>
                <v-select
                  :value="account.type"
                  :items="['Локальная', 'LDAP']"
                  @update:model-value="(val) => updateAccountField(account.id, 'type', val)"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>

              <div class="field-group">
                <label class="field-label">Логин</label>
                <v-text-field
                  :value="account.login"
                  @change="
                    (e) => updateAccountField(account.id, 'login', (e as any).target?.value || '')
                  "
                  variant="outlined"
                  density="compact"
                  placeholder="Значение"
                  hide-details
                />
              </div>

              <div class="field-group">
                <label class="field-label">Пароль</label>
                <div class="password-wrapper">
                  <v-text-field
                    :value="account.password"
                    @change="
                      (e) =>
                        updateAccountField(account.id, 'password', (e as any).target?.value || '')
                    "
                    :type="visiblePasswords.has(account.id) ? 'text' : 'password'"
                    variant="outlined"
                    density="compact"
                    placeholder="Значение"
                    hide-details
                    class="flex-grow-1"
                  />
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click="togglePasswordVisibility(account.id)"
                    class="ml-2"
                  >
                    <svg
                      v-if="visiblePasswords.has(account.id)"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="24"
                      height="24"
                    >
                      <path
                        d="M12 4C6.48 4 2.75 7.27 1.33 11.5C1.11 12.12 1.11 12.88 1.33 13.5C2.75 17.73 6.48 21 12 21C17.52 21 21.25 17.73 22.67 13.5C22.89 12.88 22.89 12.12 22.67 11.5C21.25 7.27 17.52 4 12 4ZM12 19C7.59 19 4.43 16.51 3.29 13C4.43 9.49 7.59 7 12 7C16.41 7 19.57 9.49 20.71 13C19.57 16.51 16.41 19 12 19ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9ZM12 13C11.45 13 11 12.55 11 12C11 11.45 11.45 11 12 11C12.55 11 13 11.45 13 12C13 12.55 12.55 13 12 13Z"
                      />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="24"
                      height="24"
                    >
                      <path
                        d="M12 7C6.48 7 2.75 10.27 1.33 14.5C1.11 15.12 1.11 15.88 1.33 16.5C2.75 20.73 6.48 24 12 24C17.52 24 21.25 20.73 22.67 16.5C22.89 15.88 22.89 15.12 22.67 14.5C21.25 10.27 17.52 7 12 7ZM2.81 14C3.97 11.29 7.62 9 12 9C16.38 9 20.03 11.29 21.19 14C20.03 16.71 16.38 19 12 19C7.62 19 3.97 16.71 2.81 14ZM12 17C10.34 17 9 15.66 9 14C9 12.34 10.34 11 12 11C13.66 11 15 12.34 15 14C15 15.66 13.66 17 12 17Z"
                      />
                    </svg>
                  </v-btn>
                </div>
              </div>

              <div class="field-group">
                <v-btn
                  icon
                  color="error"
                  @click="deleteAccountItem(account.id)"
                  size="small"
                  class="mt-6"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="20"
                    height="20"
                  >
                    <path
                      d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z"
                    />
                  </svg>
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAccountStore } from '../stores/accountStore'
import type { AccountType, Label } from '../types'

const accountStore = useAccountStore()
const visiblePasswords = ref<Set<string>>(new Set())

// Используем computed для реактивности
const accounts = computed(() => accountStore.accounts)

// Преобразование массива меток в строку для отображения
const getLabelsAsString = (labels: Label[]): string => {
  if (!labels || !Array.isArray(labels)) return ''
  return labels.map((label) => label.text).join('; ')
}

// Преобразование строки меток в массив объектов для сохранения
const parseLabelsString = (labelsString: string): Label[] => {
  if (!labelsString.trim()) return []

  return labelsString
    .split(';')
    .map((label) => label.trim())
    .filter((label) => label.length > 0)
    .map((text) => ({ text }))
}

// Специальный метод для обновления меток
const updateAccountLabels = (id: string, labelsString: string) => {
  const labelsArray = parseLabelsString(labelsString)
  accountStore.updateAccount(id, { label: labelsArray })
}

// Общий метод для обновления других полей
const updateAccountField = (id: string, field: string, value: string | AccountType) => {
  accountStore.updateAccount(id, { [field]: value } as any)
}

const deleteAccountItem = async (id: string) => {
  if (confirm('Вы уверены, что хотите удалить эту учетную запись?')) {
    try {
      await accountStore.deleteAccount(id)
      console.log('Account deleted successfully:', id)

      // Проверим состояние store после удаления
      console.log('Current accounts in store:', accountStore.accounts)
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Произошла ошибка при удалении учетной записи')
    }
  }
}

const togglePasswordVisibility = (id: string) => {
  if (visiblePasswords.value.has(id)) {
    visiblePasswords.value.delete(id)
  } else {
    visiblePasswords.value.add(id)
  }
}

const openAddForm = () => {
  const event = new CustomEvent('open-add-form')
  window.dispatchEvent(event)
}
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: start;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #999;
  letter-spacing: 0.5px;
}

.password-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.space-y-4 > * + * {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>
