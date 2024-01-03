'use client'

import React from 'react'

export default function useScript() {
  const loadScript = (url:string) => {
     if (typeof window !== "undefined") {
        var aScript = document.createElement('script');
        aScript.type = 'text/javascript';
        aScript.src = url;

        document.head.appendChild(aScript);
        
    }
  }
  return {loadScript}
}
