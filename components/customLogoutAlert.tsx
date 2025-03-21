// components/CustomLogoutAlert.tsx
import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";

interface CustomLogoutAlertProps {
  visible: boolean;
  onClose: () => void;
  onVisitWebsite: () => void;
}

const CustomLogoutAlert: React.FC<CustomLogoutAlertProps> = ({ visible, onClose, onVisitWebsite }) => {
  return (
    <Modal transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>You're logged out!</Text>
          <Text style={styles.message}>
            To logout of your Spiritbulb account, visit spiritbulb.com
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.visitButton]}
              onPress={onVisitWebsite}
            >
              <Text style={styles.buttonText}>Visit Spiritbulb</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.okButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  visitButton: {
    backgroundColor: "#76422b",
  },
  okButton: {
    backgroundColor: "#6C757D",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CustomLogoutAlert;