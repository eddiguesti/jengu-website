---
title: "RESEARCH: \"ASAP: Revolutionizing Humanoid Robots with Real-World Agility\""
subtitle: "An insightful look into 'RESEARCH: \"ASAP: Revolutionizing Humanoid Robots with Real-World Agility\"'"
description: "The development of humanoid robots capable of performing agile, whole-body skills has taken a significant leap forward with the introduction of ASAP (Aligning Simulation and Real Physics), as detailed in a new research article. ASAP addresses the persistent challenge of dynamics mismatch between simulated and real-world environments, which has typically hindered robots' agility. The two-stage framework begins by pre-training motion policies using human motion data in simulations. This is followed by real-world deployment to gather data, subsequently training a delta action model to bridge the gap between simulated and actual dynamics. The study evaluated ASAP across various platforms, demonstrating a marked improvement in agility and coordination, surpassing traditional methods such as system identification and domain randomization. By effectively aligning simulation with real-world physics, ASAP pioneers"
publishedOn: 2025-04-07
updatedOn: 2025-02-17
mainImage: "https://cdn.prod.website-files.com/672916ba596e9ad764eea6e4/67a38f7ef94f1b095e40350d_tmp4z3fpiqd.png"
thumbnail: ""
altTextThumbnail: ""
altTextMainImage: "A visually stunning main image for the article: RESEARCH: \"ASAP: Revolutionizing Humanoid Robots with Real-World Agility\""
source: "agile.human2humanoid.com"
newsDate: 2025-02-05
draft: false
archived: false
---

<h2>ASAP: Revolutionizing Humanoid Robots with Real-World Agility</h2>

<h3>Introduction</h3>

In the continually evolving fields of automation and artificial intelligence, ASAP (Aligning Simulation and Real Physics) is emerging as a breakthrough framework set to revolutionize the agility and coordination of humanoid robots. By addressing the complex challenges posed by the dynamics mismatch between simulation environments and real-world physics, ASAP facilitates the learning of agile, whole-body skills in humanoid robots, enhancing their potential to perform human-like tasks with unprecedented precision and efficiency.

<h3>Background and Challenges</h3>

The ability of humanoid robots to replicate agile and coordinated human motions has been hindered by inadequacies in existing methodologies such as system identification (SysID) and domain randomization (DR). These approaches often require intensive parameter tuning or lead to overly conservative motion policies, limiting the robots' agility. Recognizing these limitations, a team of researchers including Tairan He, Jiawei Gao, Wenli Xiao, and others have pioneered the ASAP framework, aimed at overcoming these barriers.

<h3>The ASAP Framework</h3>

<h4>Motion Tracking Pre-training and Real Trajectory Collection</h4>
The ASAP framework begins by pre-training motion tracking policies using retargeted human motion data within a simulation environment. This step is crucial for generating realistic trajectories that mimic those of real-world scenarios.

<h4>Delta Action Model Training</h4>
Utilizing the data collected from real-world rollout of these pre-trained policies, the team develops a delta action model. By minimizing the discrepancy between the states of simulation (s_t) and real-world (s^r_t), this model is designed to rectify the dynamics mismatch, ensuring more accurate emulation of real-world conditions in simulations.

<h4>Policy Fine-tuning</h4>
Following the delta action model training, the model is integrated into the simulator. This integration allows for fine-tuning of the existing motion tracking policies, further aligning them with real-world physics, thus enhancing their agility and coordination.

<h4>Real-World Deployment</h4>
After fine-tuning, the optimized policy is deployed directly in the real world. Remarkably, this deployment omits the delta action model, relying entirely on the refined policies to execute agile motions akin to those observed in human athletes like Cristiano Ronaldo and LeBron James.

<h3>Evaluation and Outcomes</h3>

The ASAP framework's efficiency was tested across various transfer scenarios including IsaacGym to IsaacSim, IsaacGym to Genesis, and IsaacGym to a real-world Unitree G1 humanoid robot. The results indicated substantial improvements in agility and coordination over existing methodologies like SysID and DR, with notable reductions in tracking errors. The framework supports agile motions such as side jumps and forward kicks, proving its effectiveness.

<h3>Conclusion</h3>

ASAP demonstrates a significant leap forward in the field of humanoid robotics, seamlessly bridging the gap between simulation and real-world dynamics. Its success paves a promising path for future developments in the sim-to-real transfer of agility and expressive capability in humanoids. With these advancements, humanoid robots are poised to assume more complex roles across diverse applications, transforming industries through enhanced automation and AI integration.