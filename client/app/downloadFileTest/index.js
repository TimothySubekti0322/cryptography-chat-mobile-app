import { shareAsync } from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import React from "react";
import { Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  async function download() {
    const filename = "dummy.pdf";

    const result = await FileSystem.downloadAsync(
      "https://res.cloudinary.com/djkckue0o/image/upload/v1713633552/pq4auddctp2hedunpdtr.pdf",
      FileSystem.documentDirectory + filename
    );

    // Log the download result
    console.log(result.headers["content-type"]);

    // Save the downloaded file
    saveFile(result.uri, filename, result.headers["content-type"]);
  }

  async function saveFile(uri, filename, mimetype) {
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
  return (
    <SafeAreaView className="items-center justify-center" style={{ flex: 1 }}>
      <Button title="Download" onPress={download} />
    </SafeAreaView>
  );
}
