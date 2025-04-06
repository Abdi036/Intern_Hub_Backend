import { Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

export default function CustomButton() {
  return (
    <TouchableOpacity className='text-red-500'>
      <Text>CustomButton</Text>
    </TouchableOpacity>
  )
}
