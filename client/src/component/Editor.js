import React, { useEffect, useRef } from 'react';
import CodeMirror from "codemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

const Editor = ({ socketRef, roomId, onCodeChange}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          viewportMargin: Infinity,
          lineWrapping: false,
        }
      );

      editorRef.current = editor; // ✅ Store CodeMirror instance

      editor.setSize("100%", "100%");
      editor.scrollTo(0, 0);

      // When user types → emit code change
      editor.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code)
        if (origin !== "setValue") {
          socketRef.current.emit("code-change", { roomId, code });
        }
      });
    };

    init();
  }, [roomId, socketRef]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("code-change", ({ code }) => {
        if (code !== null && editorRef.current) {
          if (code !== editorRef.current.getValue()) {
            editorRef.current.setValue(code);
          }
        }
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off("code-change");
      }
    };
  }, [socketRef]);

  return (
    <div style={{ height: "100%", transform: "none", zoom: 1 }}>
      <textarea id="realtimeEditor" style={{ width: "100%", height: "100%" }}></textarea>
    </div>
  );
};

export default Editor;
