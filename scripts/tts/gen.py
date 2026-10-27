import json, subprocess, wave, os
M=os.environ.get("PIPER_MODEL","tts-models/en_GB-vctk-medium.onnx")
PIPER=os.environ.get("PIPER_BIN","piper")
AGENT=87  # VCTK p248 (Indian English, female)
clips = {
 "sales-test-drive": {"customer": 92, "lines": [  # p251 Indian English male
  ("agent","Hi! I’m calling about the SUV you enquired about. Is this a good time?", "Hi! I'm calling about the S U V you enquired about. Is this a good time?"),
  ("user","Yes! Can I take a test drive?", None),
  ("agent","Of course! Does Saturday at 11 AM work for you?", "Of course! Does Saturday at eleven A M work for you?"),
  ("user","Saturday works.", None),
  ("agent","It’s booked! I’ve sent the details to your WhatsApp.", "It's booked! I've sent the details to your WhatsApp."),
 ]},
 "service-refund": {"customer": 26, "lines": [  # p376 Indian English male
  ("user","Hi, one item in order #OD1024 came damaged. I want a refund.", "Hi, one item in order O D one zero two four came damaged. I want a refund."),
  ("agent","Sorry about that! Is it the blue kurta from order #OD1024?", "Sorry about that! Is it the blue kurta from order O D one zero two four?"),
  ("user","Yes, that one.", None),
  ("agent","All done. Your refund is initiated, and you’ll get an SMS shortly.", "All done. Your refund is initiated, and you'll get an S M S shortly."),
  ("user","That was quick, thanks!", None),
  ("agent","Happy to help. Have a great day!", None),
 ]},
}
LEAD, GAP = 0.35, 0.5
out = {}
for name, c in clips.items():
  parts=[]; t=LEAD; cues=[]
  for i,(who,cap,tts) in enumerate(c["lines"]):
    f=f"{name}-{i}.wav"; spk = AGENT if who=="agent" else c["customer"]
    subprocess.run([PIPER,"-m",M,"-s",str(spk),"--length-scale","1.05" if who=="agent" else "1.0","-f",f],input=(tts or cap).encode(),check=True,capture_output=True)
    with wave.open(f) as w: d=w.getnframes()/w.getframerate(); sr=w.getframerate()
    cues.append({"from":who,"text":cap,"start":round(t,2),"end":round(t+d,2)}); parts.append((f,d)); t+=d+GAP
  total=t-GAP+0.4
  # stitch: silence lead + line + gap ...
  inputs=[]; filt=[]
  inputs += ["-f","lavfi","-t",str(LEAD),"-i",f"anullsrc=r={sr}:cl=mono"]
  n=1; seq=["[0:a]"]
  for k,(f,d) in enumerate(parts):
    inputs += ["-i",f]; seq.append(f"[{n}:a]"); n+=1
    tail = GAP if k < len(parts)-1 else 0.4
    inputs += ["-f","lavfi","-t",str(tail),"-i",f"anullsrc=r={sr}:cl=mono"]; seq.append(f"[{n}:a]"); n+=1
  fc="".join(seq)+f"concat=n={len(seq)}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11[o]"
  subprocess.run(["ffmpeg","-y","-loglevel","error",*inputs,"-filter_complex",fc,"-map","[o]","-ac","1","-ar","22050","-c:a","libmp3lame","-b:a","48k",f"{name}.mp3"],check=True)
  dur=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f"{name}.mp3"]))
  out[name]={"duration":round(dur,2),"cues":cues}
  print(name, round(dur,2), "s", os.path.getsize(f"{name}.mp3")//1024, "KB")
json.dump(out,open("cues.json","w"),indent=1,ensure_ascii=False)
