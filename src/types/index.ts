export type AccountType = 'Локальная' | 'LDAP'

export interface Label {
  text: string
}

export interface Account {
  id: string
  label: Label[]
  type: AccountType
  login: string
  password: string
}

export const ACCOUNT_TYPES: AccountType[] = ['Локальная', 'LDAP']
