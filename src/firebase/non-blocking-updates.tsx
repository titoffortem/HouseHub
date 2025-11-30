
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Returns a promise that resolves on success or rejects with an error.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    setDoc(docRef, data, options)
      .then(resolve)
      .catch(error => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'write', 
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
        reject(permissionError); 
      });
  });
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Returns a promise that resolves on success or rejects with an error.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
        addDoc(colRef, data)
            .then(() => resolve())
            .catch(error => {
                const permissionError = new FirestorePermissionError({
                    path: colRef.path,
                    operation: 'create',
                    requestResourceData: data,
                });
                errorEmitter.emit('permission-error', permissionError);
                reject(permissionError);
            });
    });
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Returns a promise that resolves on success or rejects with an error.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
        updateDoc(docRef, data)
            .then(resolve)
            .catch(error => {
                const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'update',
                    requestResourceData: data,
                });
                errorEmitter.emit('permission-error', permissionError);
                reject(permissionError);
            });
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Returns a promise that resolves on success or rejects with an error.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference): Promise<void> {
  return new Promise((resolve, reject) => {
    deleteDoc(docRef)
      .then(resolve)
      .catch(error => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        reject(permissionError); // Reject the promise with the rich error
      });
  });
}
