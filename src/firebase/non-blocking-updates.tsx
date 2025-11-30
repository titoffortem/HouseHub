
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
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options)
    .catch(error => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', 
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Returns a promise that resolves on success or rejects with an error.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
    addDoc(colRef, data)
        .catch(error => {
            const permissionError = new FirestorePermissionError({
                path: colRef.path,
                operation: 'create',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Returns a promise that resolves on success or rejects with an error.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
    updateDoc(docRef, data)
        .catch(error => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
}
