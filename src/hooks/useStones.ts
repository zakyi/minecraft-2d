import { ref } from 'vue'
import { stoneConfig } from '../data/config'

export const useStones = () => {
  const config = ref(stoneConfig)

  return { config }
}
