import { useLocalSearchParams } from "expo-router";
import {View, Text, StyleSheet, Pressable, TextInput} from "react-native";
import { useState, useEffect, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "@/context/ThemeContext";
import { Inter_500Medium, useFonts} from "@expo-google-fonts/inter";
import{StatusBar} from "expo-status-bar";
import {Octicons} from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";

export default  function EditScreen(){
    const {id} = useLocalSearchParams();
    const [todo, setTodo] = useState({});
    const {colorScheme, setColorScheme, theme} = useContext(ThemeContext);
    const styles= createStyles(theme, colorScheme);

    const[loaded, error] = useFonts({ Inter_500Medium,  });

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {  // Remove id parameter
            try {
                const jsonValue = await AsyncStorage.getItem('TodoApp');
                const storageTodos = jsonValue != null ? JSON.parse(jsonValue) : [];
    
                if (storageTodos.length) {
                    const myTodo = storageTodos.find(todo => todo.id.toString() === id.toString());
                    console.log("Found Todo:", myTodo);
    
                    // Ensure state doesn't become undefined
                    setTodo(myTodo || { task: "" });
    
                    // Debugging: Log all stored todos
                    console.log("Stored Todos:", storageTodos);
                } else {
                    console.warn("No todos found in storage!");
                }
            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };
    
        fetchData();
    }, [id]);
    

    const handleSave = async() => {
        try {
            const savedTodo = {...todo, task: todo.task}
            const jsonValue = await AsyncStorage.getItem('TodoApp');
            const storageTodos = jsonValue != null ? JSON.parse(jsonValue) : null;
            if (storageTodos && storageTodos.length) {
                const otherTodos = storageTodos.filter(todo => todo.id !== savedTodo.id);
                const allTodos = [...otherTodos, savedTodo];
                await AsyncStorage.setItem('TodoApp', JSON.stringify(allTodos));
            } else {
                await AsyncStorage.setItem('TodoApp', JSON.stringify([savedTodo]));
            }
            router.push("/")
        } catch (e) {
            console.error(e)
        }
    }

    if (!loaded && !error) {
        return null;
      }

    return(
        <SafeAreaView style={styles.container}>
        <View style={styles.inputContainer}>
            <TextInput 
            style={styles.input}
            placeholder="Edit Todo"
            placeholderTextColor="gray"
            value={todo?.task || ""}
            onChangeText={(text) => setTodo(prev => ({...todo, task: text}))}
            />
            <Pressable onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')} style={{marginLeft: 10}}>
                < Octicons name={colorScheme === 'dark' ? 'sun' : 'moon'} size={36} color={theme.text} selectable={undefined}/>
             </Pressable>

        </View>
        <View style={styles.inputContainer}>
            <Pressable 
            onPress={handleSave}
            style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
            <Pressable 
            onPress={() => router.push("/")}
            style={[styles.saveButton, {backgroundColor: "red"}]}>
                <Text style={[styles.saveButtonText, {color: "white"}]}>Cancel</Text>
            </Pressable>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </View>
        </SafeAreaView>
    )
}

function createStyles(theme, colorScheme) { 

    return StyleSheet.create({
        container: {
            flex: 1,
            width: "100%",
            backgroundColor: theme.background,
        },
        inputContainer: {
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            width: "100%",
            maxWidth: 1024,
            marginHorizontal: "auto",
            pointerEvents: "auto",
            marginBottom: 20,
        },
        input: {
            fontFamily: "Inter_500Medium",
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: "gray",
            borderRadius: 5,
            marginRight: 10,
            paddingHorizontal: 10,
            fontSize: 18,
            color: theme.text,
        },
        saveButton: {
            
            backgroundColor: theme.background,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: theme.text,
            marginRight: 10,
            backgroundColor: theme.ThemeContext,
        },
        saveButtonText: {
            color: theme.text,
            fontSize: 16,
            fontWeight: "bold",
        },

    })

}