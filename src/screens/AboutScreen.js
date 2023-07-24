import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, Image, } from 'react-native'
import { WebView } from "react-native-webview";
import Network from "../constants/Network";
import axios from "axios";



export default function AboutScreen() {


  const [html, setHTML] = useState('<p>Please Wait..</p>');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      getHTML();
    }
  }, [loaded]); //Empty array for deps.

  async function getHTML() {

    const url = Network.apiurl + 'about/';
    //console.log(url)
    const result = await axios.get(url, { headers: { 'Authorization': Network.token } }).then(function (response) {
      console.log(response.data);
      setLoaded(true);
      if (response.data.status == true) {
        setHTML(response.data.result ? response.data.result : '');
      }
      return true;
    }).catch(error => console.error());
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: html }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10
  },

});
