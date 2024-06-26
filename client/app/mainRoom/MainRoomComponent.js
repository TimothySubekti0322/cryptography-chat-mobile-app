import { shareAsync } from "expo-sharing";
import { useContext, useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  Alert,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Stack, router } from "expo-router";

import { CredentialContext } from "../../store/context/credential-context";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Contact from "../../components/contact";
import API_DEV from "../../static/api";
import axios from "axios";

import { ActivityIndicator } from "react-native-paper";

import { saveFile, createTextFileFromPlainText } from "../../utils/saveFile";

const MainRoomComponent = ({ showModal, visible }) => {
  const credentialCtx = useContext(CredentialContext);

  const [username, setUsername] = useState("");

  const [loadingData, setLoadingData] = useState(false);

  const [contactList, setContactList] = useState([]);

  // const [keys, setKeys] = useState({
  //   publicKey: 0n,
  //   privateKey: 0n,
  //   modulus: 0n,
  // });

  const downloadPrivateKey = async () => {
    try {
      const d = await AsyncStorage.getItem("d");
      const n = await AsyncStorage.getItem("n");
      const privateKey = `(${d},${n})`;
      console.log("privateKey", privateKey);
      await createTextFileFromPlainText(privateKey, "*.pri");
    } catch (error) {}
  };

  const downloadPublicKey = async () => {
    try {
      const e = await AsyncStorage.getItem("e");
      const n = await AsyncStorage.getItem("n");
      const publicKey = `(${e},${n})`;
      console.log("publicKey", publicKey);
      await createTextFileFromPlainText(publicKey, "*.pub");
    } catch (error) {}
  };

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const username = await AsyncStorage.getItem("username");
        setUsername(username);

        if (!username) {
          Alert.alert("Error", "username not found", [
            { text: "Back to Home", onPress: () => router.replace("/") },
          ]);
        }

        const responseUser = await axios.get(`${API_DEV}/user/${username}`);

        // setKeys({
        //   publicKey: responseUser.data.e,
        //   privateKey: responseUser.data.d,
        //   modulus: responseUser.data.n,
        // });

        const responseRooms = await axios.get(
          `${API_DEV}/rooms-and-messages/${username}`
        );

        setContactList(responseRooms.data.rooms);
      } catch (error) {
        Alert.alert("Error", error.message, [
          { text: "Back to Home", onPress: () => router.replace("/") },
        ]);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  async function saveFile(uri, filename, mimetype) {
    // copas dr utils
    if (Platform.OS === "android") {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        try {
          console.log("permissions.directoryUri = ", permissions.directoryUri);
          console.log("filename = ", filename);
          console.log("mimetype = ", mimetype);
          const fileUri =
            await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              filename,
              mimetype
            );

          console.log("File created at: " + fileUri);

          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (error) {
          console.log("Error creating or writing to file:", error);
        }
      } else {
        console.log("Permission denied");
        console.log(uri);
        shareAsync(uri);
      }
    } else {
      console.log("Permission denied");
      console.log(uri);
      shareAsync(uri);
    }
  }

  const signOutHandler = () => {
    credentialCtx.setUsername("");
    credentialCtx.setPassword("");

    router.replace("/");
  };

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const username = await AsyncStorage.getItem("username");
        setUsername(username);

        if (!username) {
          Alert.alert("Error", "username not found", [
            { text: "Back to Home", onPress: () => router.replace("/") },
          ]);
        }

        const response = await axios.get(
          `${API_DEV}/rooms-and-messages/${username}`
        );

        setContactList(response.data.rooms);
      } catch (error) {
        Alert.alert("Error", error.message, [
          { text: "Back to Home", onPress: () => router.replace("/") },
        ]);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [visible]);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar backgroundColor="#C4E0B4" barStyle="dark-content" />
      {loadingData ? (
        <SafeAreaView
          className="items-center justify-center bg-[#FFE6AB]"
          style={{ flex: 1 }}
        >
          <ActivityIndicator animating={true} color="#C4E0B4" size="large" />
        </SafeAreaView>
      ) : (
        <SafeAreaView className="" style={{ flex: 1 }}>
          <View className="flex-row items-center w-full px-6 py-6 bg-[#C4E0B4]">
            <Image source={require("../../assets/header-avatar.png")} />

            <View className="items-start ml-4 gap-y-1">
              <Text className="text-2xl font-bold">{username}</Text>
              <View className="flex-row items-center gap-x-1">
                <Pressable onPress={downloadPrivateKey}>
                  <Text className="text-[#c69c8f]">download private key</Text>
                </Pressable>
                <Text>|</Text>
                <Pressable onPress={downloadPublicKey}>
                  <Text className="text-[#c69c8f]">public key</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Contact List */}
          <View
            className="bg-[#FFE6AB] w-full px-[10%] pt-[10%]"
            style={{ flex: 1 }}
          >
            <Text className="mb-4 text-2xl font-bold">Contacts</Text>
            <ScrollView
              className="h-[70%]"
              showsVerticalScrollIndicator={false}
            >
              {contactList.map((contact) => (
                <Contact
                  key={contact.id}
                  id={contact.id}
                  contact={contact.username}
                  lastMessage={contact.lastMessage}
                />
              ))}
              <View className="">
                <Pressable
                  className="flex-row items-center w-full py-3"
                  android_ripple={{ color: "#DAD4C0" }}
                  onPress={showModal}
                >
                  <Image source={require("../../assets/plus.png")} />
                  <View className="flex-col ml-4">
                    <Text className="text-lg">Add Contact</Text>
                  </View>
                </Pressable>
              </View>
            </ScrollView>
            <View
              className="flex-row items-center justify-end w-full py-4"
              style={{ flex: 1 }}
            >
              <Pressable
                className="flex-row items-center px-2 py-1"
                android_ripple={{ color: "#E5242B" }}
                onPress={signOutHandler}
              >
                <Text>Log Out</Text>
                <Image
                  source={require("../../assets/logout.png")}
                  className="ml-2"
                />
              </Pressable>

              <Image
                source={require("../../assets/cat-logo.png")}
                className="w-20"
                style={{ resizeMode: "contain" }}
              />
            </View>
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

export default MainRoomComponent;
