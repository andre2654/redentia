export const useProfileService = () => {
  async function getMe() {
    return {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com'
    }
  }

  return {
    getMe
  }
}