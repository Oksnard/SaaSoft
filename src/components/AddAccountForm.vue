<template>
  <v-dialog v-model="isOpen" max-width="500px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Добавить новую учетную запись</span>
        <v-btn icon @click="closeModal" variant="text">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
            height="24"
          >
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z"
            />
          </svg>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-alert color="info" variant="outlined" class="mb-6">
          <template #prepend>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="24"
              height="24"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
          </template>
          Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
        </v-alert>

        <form @submit.prevent="submitForm" class="space-y-6">
          <div>
            <label class="text-subtitle2 font-weight-600">Метки</label>
            <v-text-field
              v-model="formData.labelsString"
              type="text"
              variant="outlined"
              density="comfortable"
              maxlength="50"
              placeholder="Введите метки через ;"
              @blur="validateLabels"
              @input="clearFieldError('labels')"
              :error="!!fieldErrors.labels"
              :error-messages="fieldErrors.labels ? [fieldErrors.labels] : []"
              :counter="50"
            />
          </div>

          <div>
            <label class="text-subtitle2 font-weight-600">Тип записи</label>
            <v-select
              v-model="formData.type"
              :items="accountTypes"
              variant="outlined"
              density="comfortable"
              @update:model-value="clearFieldError('type')"
              :error="!!fieldErrors.type"
              :error-messages="fieldErrors.type ? [fieldErrors.type] : []"
            />
          </div>

          <div>
            <label class="text-subtitle2 font-weight-600">Логин</label>
            <v-text-field
              v-model="formData.login"
              type="text"
              variant="outlined"
              density="comfortable"
              placeholder="Значение"
              required
              @blur="validateLogin"
              @input="clearFieldError('login')"
              :error="!!fieldErrors.login"
              :error-messages="fieldErrors.login ? [fieldErrors.login] : []"
              :counter="100"
            />
          </div>

          <div v-if="formData.type === 'Локальная'">
            <label class="text-subtitle2 font-weight-600">Пароль</label>
            <v-text-field
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              placeholder="Значение"
              required
              @blur="validatePassword"
              @input="clearFieldError('password')"
              :error="!!fieldErrors.password"
              :error-messages="fieldErrors.password ? [fieldErrors.password] : []"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              :counter="50"
            />
          </div>

          <div class="d-flex gap-3 justify-end pt-4">
            <v-btn color="default" @click="closeModal">Отмена</v-btn>
            <v-btn color="primary" type="submit">Добавить</v-btn>
          </div>
        </form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAccountStore } from '../stores/accountStore'
import type { Account, AccountType } from '../types'

const ACCOUNT_TYPES = ['Локальная', 'LDAP'] as const
const VALIDATION_RULES = {
  LABEL_MAX_LENGTH: 50,
  LOGIN_MAX_LENGTH: 100,
  LOGIN_MIN_LENGTH: 3,
  PASSWORD_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6,
} as const

const accountStore = useAccountStore()

const isOpen = ref(false)
const showPassword = ref(false)

const formData = ref({
  labelsString: '',
  type: 'Локальная' as AccountType,
  login: '',
  password: '',
})

const fieldErrors = ref<Record<string, string>>({
  labels: '',
  type: '',
  login: '',
  password: '',
})

const accountTypes = computed(() => ACCOUNT_TYPES)

const parseLabels = (labelsString: string): Array<{ text: string }> => {
  if (!labelsString.trim()) return []

  return labelsString
    .split(';')
    .map((label) => label.trim())
    .filter((label) => label.length > 0)
    .map((labelText) => ({ text: labelText }))
}

const validateLabels = (): boolean => {
  const labelsString = formData.value.labelsString.trim()
  fieldErrors.value.labels = ''

  if (labelsString.length > VALIDATION_RULES.LABEL_MAX_LENGTH) {
    fieldErrors.value.labels = 'Максимум 50 символов'
    return false
  }

  // Проверка на валидные метки
  const invalidLabels = labelsString.split(';').filter((item) => {
    const trimmed = item.trim()
    return trimmed && !/^[a-zA-Zа-яА-Я0-9\s]+$/.test(trimmed)
  })

  if (invalidLabels.length > 0) {
    fieldErrors.value.labels = 'Метки могут содержать только буквы, цифры и пробелы'
    return false
  }

  return true
}

const validateType = (): boolean => {
  fieldErrors.value.type = ''

  if (!formData.value.type) {
    fieldErrors.value.type = 'Тип записи обязателен'
    return false
  }

  if (!ACCOUNT_TYPES.includes(formData.value.type)) {
    fieldErrors.value.type = 'Неверный тип записи'
    return false
  }

  return true
}

const validateLogin = (): boolean => {
  const login = formData.value.login.trim()
  fieldErrors.value.login = ''

  if (!login) {
    fieldErrors.value.login = 'Логин обязателен'
    return false
  }

  if (login.length > VALIDATION_RULES.LOGIN_MAX_LENGTH) {
    fieldErrors.value.login = 'Максимум 100 символов'
    return false
  }

  if (login.length < VALIDATION_RULES.LOGIN_MIN_LENGTH) {
    fieldErrors.value.login = 'Логин должен содержать минимум 3 символа'
    return false
  }

  if (!/^[a-zA-Z0-9_\-@.]+$/.test(login)) {
    fieldErrors.value.login = 'Логин может содержать только буквы, цифры, _, -, @, .'
    return false
  }

  return true
}

const validatePassword = (): boolean => {
  fieldErrors.value.password = ''

  if (formData.value.type === 'Локальная') {
    const password = formData.value.password

    if (!password) {
      fieldErrors.value.password = 'Пароль обязателен для локальных учетных записей'
      return false
    }

    if (password.length > VALIDATION_RULES.PASSWORD_MAX_LENGTH) {
      fieldErrors.value.password = 'Максимум 50 символов'
      return false
    }

    if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      fieldErrors.value.password = 'Пароль должен содержать минимум 6 символов'
      return false
    }

    if (!/(?=.*[a-zA-Z])/.test(password)) {
      fieldErrors.value.password = 'Пароль должен содержать хотя бы одну букву'
      return false
    }
  }

  return true
}

const clearFieldError = (fieldName: string) => {
  if (fieldErrors.value[fieldName]) {
    fieldErrors.value[fieldName] = ''
  }
}

const validateForm = (): boolean => {
  const validations = [validateLabels(), validateType(), validateLogin(), validatePassword()]

  return validations.every((result) => result)
}

const openModal = () => {
  resetForm()
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
  resetForm()
}

const resetForm = () => {
  formData.value = {
    labelsString: '',
    type: 'Локальная',
    login: '',
    password: '',
  }
  fieldErrors.value = {
    labels: '',
    type: '',
    login: '',
    password: '',
  }
  showPassword.value = false
}

const submitForm = () => {
  if (!validateForm()) {
    return
  }

  const labelsArray = parseLabels(formData.value.labelsString)

  const newAccount: Account = {
    id: Date.now().toString(),
    label: labelsArray,
    type: formData.value.type,
    login: formData.value.login.trim(),
    password: formData.value.password.trim(),
  }

  accountStore.addAccount(newAccount)
  closeModal()
}

watch(
  () => formData.value.type,
  (newType: AccountType) => {
    if (newType === 'LDAP') {
      formData.value.password = ''
    }
  }
)

onMounted(() => {
  window.addEventListener('open-add-form', openModal)
})
</script>

<style scoped>
.space-y-6 > * + * {
  margin-top: 24px;
}

.gap-3 {
  gap: 12px;
}
</style>
