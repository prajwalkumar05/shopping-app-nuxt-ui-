// composables/useFirebaseUsers.js
import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot,
  orderBy,
  query,
  serverTimestamp 
} from 'firebase/firestore'

export const useFirebaseUsers = () => {
  // Statistics tracking
  const stats = ref({
    apiCalls: 0,
    cacheHits: 0,
    newUsers: 0,
    realTimeUpdates: 0
  })

  // Firebase Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAp0TJNu8uSiO6UTonuxhkcsnS8LIC3ho8",
    authDomain: "practice1-629ab.firebaseapp.com",
    projectId: "practice1-629ab",
    storageBucket: "practice1-629ab.appspot.com",
    messagingSenderId: "257678769685",
    appId: "1:257678769685:web:500d6e997790af726cd81c"
  }

  // Initialize Firebase
  let app, db
  if (process.client) {
    try {
      app = initializeApp(firebaseConfig)
      db = getFirestore(app)
      console.log('Firebase initialized successfully')
    } catch (error) {
      console.error('Firebase initialization error:', error)
    }
  }

  const usersCollection = db ? collection(db, 'users') : null

  //IndexedDB Cache 
const openDB = () => {
  return new Promise((resolve, reject) => {

    if (!process.client) {
      reject(new Error('IndexedDB only available in browser'))
      return
    }

    const request = indexedDB.open('FirebaseUsersCache', 1)
    
    // If opening fails
    request.onerror = () => reject(request.error)
    
    // If opening succeeds
    request.onsuccess = () => resolve(request.result)
    
    // If this is the FIRST TIME 
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' })
      }
      
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' })
      }
    }
  })
}

  const storeUsersInCache = async (users) => {
    if (!process.client) return

    try {
      const dbCache = await openDB()

       // Get permission to read/write in both 
      const transaction = dbCache.transaction(['users', 'metadata'], 'readwrite')
      const usersStore = transaction.objectStore('users')
      const metaStore = transaction.objectStore('metadata')
      
    // Clear out old files from 'users' 
    await usersStore.clear()
    
    // Put each user file in the 'users' 
    for (const user of users) {
      await usersStore.add(user)
    }
    
    // Put info about the files in 'metadata' 
    await metaStore.put({
      key: 'users_metadata',
      timestamp: Date.now(),        // When we saved this
      count: users.length           // How many users we saved
    })
      
      console.log(`Cached ${users.length} users locally`)
    } catch (error) {
      console.error('Cache store error:', error)
    }
  }

const getUsersFromCache = async () => {
  // Only work in browser
  if (!process.client) return { users: [], metadata: null }

  try {
    const dbCache = await openDB()
    
    // Get permission to read from both drawers
    const transaction = dbCache.transaction(['users', 'metadata'], 'readonly')
    const usersStore = transaction.objectStore('users')
    const metaStore = transaction.objectStore('metadata')
    
    // Get ALL files from 'users' 
    const users = await new Promise((resolve, reject) => {
      const request = usersStore.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    
    // Get the info note from 'metadata' 
    const metadata = await new Promise((resolve, reject) => {
      const request = metaStore.get('users_metadata')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    
    // Return both the files and the info
    return { users, metadata }
  } catch (error) {
    console.error('Cache read error:', error)
    return { users: [], metadata: null }
  }
}

  // Firebase Functions
  const fetchUsersFromFirebase = async () => {
    if (!usersCollection) throw new Error('Firebase not initialized')

    try {
      console.log('Fetching users from Firebase...')
      
      const q = query(usersCollection, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const users = []
      querySnapshot.forEach((doc) => {
        const userData = doc.data()
        users.push({
          id: doc.id,
          ...userData,
          createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt
        })
      })
      
      stats.value.apiCalls++
      console.log(`Firebase: Loaded ${users.length} users from Firestore`)
      
      return users
    } catch (error) {
      console.error('Firebase fetch error:', error)
      throw error
    }
  }

  const addNewUser = async (name, email, company) => {
    if (!usersCollection) throw new Error('Firebase not initialized')

    try {
      console.log(`Adding user to Firebase: ${name}`)
      
      const userData = {
        name,
        email,
        company: { name: company },
        phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        website: `${name.toLowerCase().replace(/\s+/g, '')}.com`,
        address: {
          city: 'Tech City',
          zipcode: `${Math.floor(Math.random() * 90000) + 10000}`,
          street: `${Math.floor(Math.random() * 9999) + 1} Innovation Blvd`
        },
        createdAt: serverTimestamp(),
        isNewUser: true
      }
      
      const docRef = await addDoc(usersCollection, userData)
      
      stats.value.apiCalls++
      console.log(`Firebase: User saved with ID: ${docRef.id}`)
      
      return {
        id: docRef.id,
        ...userData,
        createdAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Firebase add user error:', error)
      throw error
    }
  }

  // Smart users loader with cache
 const getSmartUsers = async () => {
  try {
    // Check if we have cached data
    const cached = await getUsersFromCache()
    
    //  Do we have valid cached data?
    if (cached.users && cached.users.length > 0) {
      // YES! We have cached data
      
      stats.value.cacheHits++  // Track that cache saved us time
      
      // Calculate how old the cache is
      const ageSeconds = Math.round((Date.now() - cached.metadata.timestamp) / 1000)
      
      console.log(`CACHE HIT: Loaded ${cached.users.length} users (${ageSeconds}s old)`)
      
      return cached.users  // Return the cached data (FAST!)
      
    } else {
      // NO! Cache is empty or invalid  
      console.log(`CACHE MISS: Fetching users from Firebase...`)
      
      // Go get fresh data from Firebase
      const users = await fetchUsersFromFirebase()
      
      // Save it to cache for next time
      await storeUsersInCache(users)
      
      return users  // Return the fresh data
    }
  } catch (error) {
    console.error('Smart users loading error:', error)
    throw error
  }
}

  const addUserToCache = async (newUser) => {
    if (!process.client) return

    try {
      const dbCache = await openDB()
      const transaction = dbCache.transaction(['users'], 'readwrite')
      const store = transaction.objectStore('users')
      
      await store.add(newUser)
      console.log(`Added ${newUser.name} to local cache`)
    } catch (error) {
      console.error('Error adding user to cache:', error)
    }
  }

  const forceRefresh = async () => {
    console.log('FORCE REFRESH: Fetching fresh data from Firebase')
    const users = await fetchUsersFromFirebase()
    await storeUsersInCache(users)
    return users
  }

  const clearCache = async () => {
    if (!process.client) return

    try {
      const dbCache = await openDB()
      const transaction = dbCache.transaction(['users', 'metadata'], 'readwrite')
      await transaction.objectStore('users').clear()
      await transaction.objectStore('metadata').clear()
      console.log('Local cache cleared')
    } catch (error) {
      console.error('Clear cache error:', error)
    }
  }

  // Real-time notifications
  const setupRealTimeNotifications = (onNewUser, onUserDeleted) => {
    if (!process.client || !usersCollection) return

    console.log('Setting up Firebase real-time notifications...')
    
    let isInitialLoad = true
    
    const unsubscribe = onSnapshot(
      query(usersCollection, orderBy('createdAt', 'desc')), 
      (snapshot) => {
        if (isInitialLoad) {
          isInitialLoad = false
          console.log('Initial Firebase snapshot loaded')
          return
        }
        
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const userData = change.doc.data()
            const newUser = {
              id: change.doc.id,
              ...userData,
              createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt
            }
            
            stats.value.newUsers++
            stats.value.realTimeUpdates++
            
            console.log(`REAL-TIME: New user detected: ${newUser.name}`)
            if (onNewUser) onNewUser(newUser)
          }
          
          else if (change.type === 'removed') {
            const deletedUser = {
              id: change.doc.id,
              ...change.doc.data()
            }
            
            stats.value.realTimeUpdates++
            console.log(`REAL-TIME: User deleted: ${deletedUser.name || deletedUser.id}`)
            if (onUserDeleted) onUserDeleted(deletedUser)
          }
          
          else if (change.type === 'modified') {
            const modifiedUser = {
              id: change.doc.id,
              ...change.doc.data()
            }
            
            stats.value.realTimeUpdates++
            console.log(`REAL-TIME: User modified: ${modifiedUser.name || modifiedUser.id}`)
          }
        })
      },
      (error) => {
        console.error('Firebase real-time listener error:', error)
      }
    )
    
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
        console.log('Firebase real-time listener cleaned up')
      }
    })
    
    return unsubscribe
  }

  // Test Firebase connection
  const testConnection = async () => {
    try {
      if (!usersCollection) {
        throw new Error('Firebase not initialized')
      }
      
      console.log('Testing Firebase connection...')
      await getDocs(query(usersCollection))
      console.log('Firebase connection successful!')
      return true
    } catch (error) {
      console.error('Firebase connection failed:', error)
      return false
    }
  }

  return {
    getSmartUsers,
    addNewUser,
    addUserToCache,
    forceRefresh,
    clearCache,
    setupRealTimeNotifications,
    testConnection,
    stats: readonly(stats)
  }
}