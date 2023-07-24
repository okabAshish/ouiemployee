import React from 'react';
import {ActivityIndicator} from 'react-native';

export default function Loading() {
  return (
    <ActivityIndicator
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        backgroundColor: '#fff',
      }}
      size="large"
      color="#3492eb"
    />
  );
}
