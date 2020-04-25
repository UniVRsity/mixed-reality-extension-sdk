/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

import { Test } from '../test';

const defaultRampColor = MRE.Color3.FromInts(79, 36, 6);
const defaultBallColor = MRE.Color3.FromInts(220, 150, 150);

export default class PhysicsSimTestBounce extends Test {
	public expectedResultDescription = "Bouncing balls and taking ownership.\n (Click to take ownership).";
	private assets: MRE.AssetContainer;
	private interval: NodeJS.Timeout;
	private DefaultRampMat: MRE.Material;
	private ballMat: MRE.Material;
	private collRefCount = new Map<MRE.Guid, number>();
	private ballCount = 0;
	private counterPlane: MRE.Actor;

	public async run(root: MRE.Actor): Promise<boolean> {
		this.assets = new MRE.AssetContainer(this.app.context);
		this.DefaultRampMat = this.assets.createMaterial('Ramp', {
			color: defaultRampColor
		});
		
		this.ballMat = this.assets.createMaterial('ball', {
			color: defaultBallColor
		});

		this.createCounterPlane(root, 2, 1.25);

		this.interval = setInterval(() => this.spawnBall(root, 1.5, 1.5), 100);

		await this.stoppedAsync();
		return true;
	}

	public cleanup() {
		clearInterval(this.interval);
		this.assets.unload();
	}

	private createCounterPlane(root: MRE.Actor, width: number, height: number) {
		// Create the ball count text objects
		this.counterPlane = MRE.Actor.Create(this.app.context, {
			actor: {
				parentId: root.id,
				transform: {
					app: { position: { x: -width / 2, y: height + 0.2, z: 0.01 } }
				},
				text: {
					contents: `Ball count: ${this.ballCount}`,
					anchor: MRE.TextAnchorLocation.MiddleLeft,
					height: .2
				}
			}
		});

		// Create the trigger plane for the ball counter.
		const counter = MRE.Actor.Create(this.app.context, {
			actor: {
				parentId: root.id,
				transform: {
					local: { position: { x: 0, y: height, z: 0 } }
				},
				collider: {
					geometry: {
						shape: MRE.ColliderType.Box,
						size: { x: width, y: 0.01, z: 2 }
					},
					isTrigger: true
				}
			}
		});

		counter.collider.onTrigger('trigger-enter', () => {
			++this.ballCount;
			this.counterPlane.text.contents = `Ball count: ${this.ballCount}`;
		});
	}

	private spawnBall(root: MRE.Actor, width: number, height: number, ballRadius = 0.1, killTimeout = 100000) {
		const ball = MRE.Actor.Create(this.app.context, {
			actor: {
				parentId: root.id,
				appearance: {
					meshId: this.assets.createSphereMesh('ball', ballRadius).id,
					materialId: this.ballMat.id
				},
				transform: {
					local: { position: { x: -width / 2 + width * Math.random(), y: height, z: -(0.1 + Math.random()) } }
				},
				rigidBody: {
					mass: 3,
					constraints: [MRE.RigidBodyConstraints.None]
					//constraints: [MRE.RigidBodyConstraints.FreezePositionZ]
				},
				collider: { geometry: { shape: MRE.ColliderType.Auto } }
			}
		});

		setTimeout(() => {
			// We need to disable rendering and move the ball before destroying it so that if it is currently
			// colliding with a peg, it will exit collision first for the ref counting to work properly.  Then
			// we can destroy it after another second to process the move on the client.
			ball.appearance.enabled = false;
			ball.transform.app.position = new MRE.Vector3(0, -10, 0);
			setTimeout(() => ball.destroy(), 1000);
		}, killTimeout);
	}
}
